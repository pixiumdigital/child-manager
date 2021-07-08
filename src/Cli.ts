#!/usr/bin/env node
import yargs, { Argv, command } from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as fs from 'fs'
import * as path from 'path'
import { ChildManager } from './ChildManager'
import { ChildManagerConfig } from './types'
import * as express from 'express'
import * as cors from 'cors';
import { json, urlencoded } from 'body-parser';
const configValidator = (potentialConfig: any) => {
    let isValid = true
    let errorMessage: string[] = []

    if (potentialConfig.captureExit === undefined || (potentialConfig.captureExit && typeof potentialConfig.captureExit !== "boolean")) {
        isValid = false
        errorMessage.push("Invalid config property `captureExit`. It should be defined as a boolean")
    }

    if (potentialConfig.longLive === undefined || (potentialConfig.longLive && typeof potentialConfig.longLive !== "boolean")) {
        isValid = false
        errorMessage.push("Invalid config property `longLive`. It should be defined as a boolean")
    }

    if (potentialConfig.debug === undefined || (potentialConfig.debug && typeof potentialConfig.debug !== "boolean")) {
        isValid = false
        errorMessage.push("Invalid config property `debug`. It should be defined as a boolean")
    }

    if (!potentialConfig.processes || (potentialConfig.processes && !Array.isArray(potentialConfig.processes))) {
        isValid = false
        errorMessage.push("Invalid config property `processes`. It should be defined as a array of processes")
    }

    if (potentialConfig.processes && Array.isArray(potentialConfig.processes)) {
        potentialConfig.processes.forEach((process: any) => {
            const isProcessValid = processValidator(process)
            if (!isProcessValid.isValid) {
                isValid = false
                errorMessage.concat(isProcessValid.errorMessage)
            }
        });
    }
    return { isValid, errorMessage }
}

const commandValidator = (potentialCommand: any) => {
    let isValid = true
    let errorMessage: string[] = []

    if (!potentialCommand.executor
        || (potentialCommand.executor
            && typeof potentialCommand.executor !== "string"
            && !["yarn", "npm", "yarn.cmd", "npm.cmd", "node"].includes(potentialCommand.executor)
        )) {
        isValid = false
        errorMessage.push('Invalid command property `executor`. It should be defined as a string part of: "yarn" | "npm" | "yarn.cmd" | "npm.cmd" | "node"')
    }

    if (!potentialCommand.args || (potentialCommand.args && !Array.isArray(potentialCommand.args))) {
        isValid = false
        errorMessage.push("Invalid command property `args`. It should be defined as a array of string")
    }

    if (!potentialCommand.path || (potentialCommand.path && typeof potentialCommand.path !== "string")) {
        isValid = false
        errorMessage.push("Invalid command property `path`. It should be defined as a string")
    }

    if (potentialCommand.isWindows == undefined || (potentialCommand.isWindows && typeof potentialCommand.isWindows !== "boolean")) {
        isValid = false
        errorMessage.push("Invalid command property `isWindows`. It should be defined as a boolean")
    }
    return { isValid, errorMessage }
}

const processValidator = (potentialProcess: any) => {
    let isValid = true
    let errorMessage: string[] = []

    if (!potentialProcess.name || (potentialProcess.name && typeof potentialProcess.name !== "string")) {
        isValid = false
        errorMessage.push("Invalid process property `name`. It should be defined as a string")
    }

    if (!potentialProcess.maxLogs || (potentialProcess.maxLogs && typeof potentialProcess.maxLogs !== "number")) {
        isValid = false
        errorMessage.push("Invalid process property `maxLogs`. It should be defined as a number")
    }

    if (!potentialProcess.command || (potentialProcess.command && typeof potentialProcess.command !== "object")) {
        isValid = false
        errorMessage.push("Invalid process property `command`. It should be defined as a array of command")
    }

    if (potentialProcess.command && typeof potentialProcess.command === "object") {
        const isCommandValid = commandValidator(potentialProcess.command)
        if (!isCommandValid.isValid) {
            isValid = false
            errorMessage.concat(isCommandValid.errorMessage)
        }
    }
    return { isValid, errorMessage }
}

const argv = yargs(hideBin(process.argv)).options({
    config: { type: 'string' },
    /*b: { type: 'string', demandOption: true },
    c: { type: 'number', alias: 'chill' },
    d: { type: 'array' },
    e: { type: 'count' },
    f: { choices: ['1', '2', '3'] }*/
}).parseSync();
let jsonedConfig: undefined | any = undefined
if (argv.config) {
    const normalizedPath = path.normalize(argv.config)
    if (fs.existsSync(normalizedPath)) {
        jsonedConfig = JSON.parse(fs.readFileSync(normalizedPath).toString())
    }
} else {
    const normalizedPath = path.normalize(path.join(process.cwd(), "childmanager.json"))
    console.log(normalizedPath)
    if (fs.existsSync(normalizedPath)) {
        jsonedConfig = JSON.parse(fs.readFileSync(normalizedPath).toString())
    }
}

if (jsonedConfig) {
    const isValidConfig = configValidator(jsonedConfig)
    if (isValidConfig.isValid) {
        const app = express();
        app.use(cors());
        app.use(json());
        app.use(urlencoded({ extended: true }));
        app.use(express.static(__dirname + "/dashboard"));
        const manager = new ChildManager(jsonedConfig as ChildManagerConfig)

        app.get('/status', async (req, res) => {
            res.send({ status: true })
        })
        app.get('/processes', async (req, res) => {
            res.send({ processes: Object.values(manager.processes) })
        })
        app.get('/logs/:id', async (req, res) => {
            if (req.params.id) {
                if (manager.processes[req.params.id]) {
                    res.send({ logs: manager.processes[req.params.id].logs.values, logsError: manager.processes[req.params.id].logsError.values })
                } else {
                    res.send({ logs: [], logsError: [] })
                }
            } else {
                res.send({ logs: [], logsError: [] })
            }
        })
        app.get('/restart/:id', async (req, res) => {
            if (req.params.id) {
                if (manager.processes[req.params.id]) {
                    const restarted = manager.processes[req.params.id].restart()
                    res.send({ hasRestarted: restarted })
                }
            } else {
                res.status(400).send({ error: "service not found" })
            }
        })
        app.get('/kill/:id', async (req, res) => {
            if (req.params.id) {
                if (manager.processes[req.params.id]) {
                    const killed = manager.processes[req.params.id].kill()
                    res.send({ hasKilled: killed })
                }
            } else {
                res.status(400).send({ error: "service not found" })
            }
        })
        app.listen(7000, () => {
            console.log("server started on port 7000");
        })
        setInterval(() => {
            Object.keys(manager.processes).map(key => {
                console.log(manager.processes[key].logs.values)
            })
        }, 3000)
        // create Child Manager
    } else {
        console.log(jsonedConfig)
        console.log("There was an error in your config file")
        console.log(isValidConfig.errorMessage.join('\n'))
    }
}

