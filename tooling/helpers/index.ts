import Bun from "bun"
import pino from "pino"
import pretty from "pino-pretty"

export const logger = pino(pretty())

/**
 * Run a script and log the execution time. Make sure to import this at the top
 * of your script to load environment variables before loading other dependencies.
 * @param fn - The script to run
 */
export async function runScript(fn: (...args: unknown[]) => Promise<void>) {
  logger.debug("Starting script execution...")

  const startTime = performance.now()

  try {
    await fn()
  } catch (error) {
    logger.error("Script execution failed")
    logger.error(error)
    process.exit(1)
  }

  const endTime = performance.now()
  const executionTime = endTime - startTime

  logger.debug(`Script executed in ${executionTime.toFixed(2)}ms`)

  process.exit()
}

export async function runProcess(
  command: string,
  args: string[] = [],
  options: { cwd?: string; env?: Record<string, string> } = {}
) {
  logger.debug(`Running command: ${command} ${args.join(" ")}`)

  const proc = Bun.spawn([command, ...args], {
    ...options,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  })

  await proc.exited

  if (proc.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${proc.exitCode}`)
  }
}

export * as prompt from "@clack/prompts"
