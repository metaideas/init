import "dotenv/config"
import { type ExecSyncOptions, execSync } from "node:child_process"
import { intro, log, outro } from "@clack/prompts"
/**
 * Run a script and log the execution time. Make sure to import this at the top
 * of your script to load environment variables before loading other dependencies.
 * @param fn - The script to run
 */
export async function runScript(fn: (...args: unknown[]) => Promise<void>) {
  intro("Starting script execution...")

  const startTime = performance.now()
  await fn()
  const endTime = performance.now()
  const executionTime = endTime - startTime
  log.message(`Script executed in ${executionTime.toFixed(2)}ms`)

  outro("Script execution complete!")

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
