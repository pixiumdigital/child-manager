import { ChildProcessCommand } from "../types";
import * as path from 'path'
/**
 * Standardize ChildProcessCommand for multi os calls
 * @param command The command of a child
 * @returns command -- The command of a child with proper executor
 */
export const ChildProcessCommandStd = (command: ChildProcessCommand) => {
    if (command.isWindows) {
        if (command.executor === "npm") { command.executor = "npm.cmd" }
        if (command.executor === "yarn") { command.executor = "yarn.cmd" }
    }
    command.path = path.normalize(command.path)
    return command
}