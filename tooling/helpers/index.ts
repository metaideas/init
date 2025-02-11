import "dotenv/config"
import { type ExecSyncOptions, exec, execSync } from "node:child_process"
import { promisify } from "node:util"
import { intro, log, outro } from "@clack/prompts"

/**
 * Run a script and log the execution time. Make sure to import this at the top
 * of your script to load environment variables before loading other dependencies.
 * @param fn - The script to run
 */
export async function runScript(fn: (...args: unknown[]) => Promise<void>) {
  intro("Starting script execution...")

  const startTime = performance.now()

  try {
    await fn()
  } catch (error) {
    console.error(error)
    outro("Script execution failed")
    process.exit(1)
  }

  const endTime = performance.now()
  const executionTime = endTime - startTime

  outro(`Script executed in ${executionTime.toFixed(2)}ms`)

  process.exit()
}

export function runProcess(
  command: string,
  args: string[] = [],
  options: Omit<ExecSyncOptions, "stdio"> = {}
) {
  const commandWithArgs = `${command} ${args.join(" ")}`
  log.message(`Running command: ${commandWithArgs}`)

  execSync(commandWithArgs, { ...options, stdio: "inherit" })
}

const execAsync = promisify(exec)

export async function executeCommand(command: string): Promise<string> {
  const { stdout } = await execAsync(command)
  return stdout
}
