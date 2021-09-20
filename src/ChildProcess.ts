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
            this.processStart = new Date()
            this.hook()
            this.log()

        } catch (error) {
            this.processStop = new Date()
            this.logsError.push(error)
            this.process?.kill()
        }
    }

    private hook = () => {
        if (this.process) {
            this.process.stdout.setEncoding('utf8');
            this.process.stderr.setEncoding('utf8');
            this.process.on('error', (error) => {
                this.processStop = new Date()
                this.logsError.push(error)
                this.process?.kill()
            });
            this.process.on('close', (code) => {
                this.processStop = new Date()
                this.logs.push(`Could not spawn process: ${this.processId}, at the following location: :${this.command.path}`)
                this.logs.push(`Exited with code: ${code}`)
                this.process?.kill()
                return
            });
        }
    }

    private log = () => {
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

    restart = () => {
        if (this.process) {
            console.log(this.process.pid)
            this.process.removeAllListeners()
            if (this.process.kill()) {
                this.process = undefined
                this.logs.values = []
                this.logsError.values = []
                try {
                    this.process = spawn(this.command.executor, this.command.args, {
                        cwd: this.command.path,
                    });
                    console.log(this.process.pid)
                    this.logs.push("RESTARTED THE PROCESS")
                    this.processStart = new Date()
                    this.hook()
                    this.log()
                    return true
                } catch (error) {
                    this.processStop = new Date()
                    this.logsError.push("RESTARTING THE PROCESS FAILED")
                    this.logsError.push(error)
                    this.process?.kill()
                    return false
                }
            }
        }
        return false
    }
}