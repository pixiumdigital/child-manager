import { ArrayLimited } from "array-limited";
import { ChildProcessCommandStd } from "./utils/ChildProcessCommandStd";
import { ChildProcessCommand, ChildProcessConfig } from "./types";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { SanitizeOutput } from "./utils/SanitizeOuput";

export class ChildProcess {
    command: ChildProcessCommand
    logs: ArrayLimited
    logsError: ArrayLimited
    processFinished: boolean
    processName: string
    processId: string
    processStart: Date | undefined
    processStop: Date | undefined
    private process: ChildProcessWithoutNullStreams | undefined
    constructor(config: ChildProcessConfig, id: string) {
        this.command = ChildProcessCommandStd(config.command)
        this.logs = new ArrayLimited(config.maxLogs)
        this.logsError = new ArrayLimited(config.maxLogs)
        this.processFinished = false
        this.processId = id
        this.processName = config.name
        try {
            this.process = spawn(this.command.executor, this.command.args, {
                cwd: this.command.path,
            });
            this.process.stdout.setEncoding('utf8');
            this.process.stderr.setEncoding('utf8');
            this.processStart = new Date()
            this.log()
            this.process.on('error', (error) => {
                this.processStop = new Date()
                this.logsError.push(error)
                this.process?.kill()
            });
            this.process.on('close', (code) => {
                this.processStop = new Date()
                this.logs.push(`Exited with code: ${code}`)
                this.process?.kill()
                return
            });
        } catch (error) {
            this.processStop = new Date()
            this.logsError.push(error)
            this.process?.kill()
        }
    }
    log = () => {
        this.process?.stdout.on('data', (data) => {
            this.logs.push(SanitizeOutput(data.toString()))
        });
        this.process?.stderr.on('data', (data) => {
            this.logsError.push(SanitizeOutput(data.toString()))
        })
    }
    kill = () => {
        if (this.process) {
            return this.process.kill()
        }
        return false
    }
}