import { type ExecSyncOptions, exec, execSync } from "node:child_process"
import { promisify } from "node:util"

export function runProcess(
  command: string,
  args: string[] = [],
  options: Omit<ExecSyncOptions, "stdio"> = {}
) {
  const commandWithArgs = `${command} ${args.join(" ")}`

  execSync(commandWithArgs, { ...options, stdio: "inherit" })
}

const execAsync = promisify(exec)

export async function executeCommand(command: string): Promise<string> {
  const { stdout } = await execAsync(command)
  return stdout
}
