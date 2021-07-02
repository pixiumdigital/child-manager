import { ChildManagerConfig } from "../types";
import { ChildProcess } from "./ChildProcess";
import * as cuid from 'cuid'
export class ChildManager {
    processes: Record<string, ChildProcess>
    constructor(config: ChildManagerConfig) {
        this.processes = {}
        config.processes.forEach(childProcessConfig => {
            const id = cuid()
            const newProcess = new ChildProcess(childProcessConfig, id)
            this.processes[id] = newProcess
            console.log(`SPAWNED - Process ${newProcess.processName} with ID ${newProcess.processId} has started`)
        })
    }

    log = () => {
        Object.keys(this.processes).map((key, index) => {
            console.log(`${index}  --  ${key}  --  ${this.processes[key].processName}  --  ${this.processes[key].process.pid}`)
        })
    }

    kill = () => {
        console.log(``)
        Object.values(this.processes).forEach(child => {
            if (child.processFinished !== true) {
                if (child.process.kill()) {
                    child.processFinished = true
                    console.log(`EXITTED - ${child.processName}`)
                } else {
                    console.log(`ERROR - Could not exit process ${child.processName}`)
                }
            }

        })
    }
}