import "dotenv/config"

/**
 * Run a script and log the execution time. Make sure to import this at the top
 * of your script to load environment variables before loading other dependencies.
 * @param fn - The script to run
 */
export async function runScript(fn: (...args: unknown[]) => Promise<void>) {
  console.info("Starting script execution...")
  console.time("Script executed")
  await fn()
  console.timeEnd("Script executed")

  process.exit()
}
