import { ChildManagerConfig } from "./types";
import { ChildProcess } from "./ChildProcess";
import * as cuid from 'cuid'
export class ChildManager {
    processes: Record<string, ChildProcess>
    constructor(config: ChildManagerConfig) {
        this.processes = {}
        // Captures the process exit and kills everything before killing itself
        if (config.captureExit === true) {
            //do something when app is closing
            process.on('exit', this.exitHandler.bind(null, { cleanup: true }));
            //catches ctrl+c event
            process.on('SIGINT', this.exitHandler.bind(null, { exit: true }));
            // catches "kill pid" (for example: nodemon restart)
            process.on('SIGUSR1', this.exitHandler.bind(null, { exit: true }));
            process.on('SIGUSR2', this.exitHandler.bind(null, { exit: true }));
            //catches uncaught exceptions
            process.on('uncaughtException', this.exitHandler.bind(null, { exit: true }));
        }
        // If long live make sure the process doesnt stop
        if (config.longLive === true) {
            setInterval(() => { }, 1 << 30);
        }
        // Spawn all children
        config.processes.forEach(childProcessConfig => {
            const id = cuid()
            const newProcess = new ChildProcess(childProcessConfig, id)
            this.processes[id] = newProcess
            console.log(`SPAWNED - Process ${newProcess.processName} with ID ${newProcess.processId} has started`)
        })
    }

    log = () => {
        Object.keys(this.processes).map((key, index) => {
            console.log(`${index}  --  ${key}  --  ${this.processes[key].processName}  --  ${this.processes[key].process?.pid}`)
        })
    }

    private exitHandler = (options: any | null, exitCode: any) => {
        this.killChildren()
        // if (options.cleanup) console.log('clean');
        // if (exitCode || exitCode === 0) console.log(exitCode);
        if (options?.exit) {
            console.log(`EXITTED - Child Manager`)
            process.exit(exitCode);
        }
    }

    kill = () => {
        this.exitHandler({ exit: true }, 1)
    }

    killChildren = () => {
        Object.values(this.processes).forEach(child => {
            if (child.processFinished !== true) {
                if (child.process?.kill()) {
                    child.processFinished = true
                    // console.log(`EXITTED - ${child.processName}`)
                } else {
                    //console.log(`ERROR - Could not exit process ${child.processName}`)
                }
            }

        })
    }
}