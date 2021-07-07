export interface ChildProcessCommand {
    executor: "yarn" | "npm" | "yarn.cmd" | "npm.cmd" | "node"
    args: string[],
    path: string
    isWindows: boolean
}

export interface ChildProcessConfig {
    name: string,
    command: ChildProcessCommand
    maxLogs: number
}

export interface ChildManagerConfig {
    processes: ChildProcessConfig[]
    captureExit: boolean
    longLive: boolean
    debug: boolean
}