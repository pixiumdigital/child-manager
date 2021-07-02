export interface ChildProcessCommand {
    executor: "yarn" | "npm" | "yarn.cmd" | "npm.cmd"
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
}