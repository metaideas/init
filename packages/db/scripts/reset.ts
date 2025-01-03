import { access, readdir, unlink, writeFile } from "node:fs/promises"
import { intro, log, outro } from "@clack/prompts"
import { runScript } from "@tooling/utils"

async function reset() {
  intro("Resetting database...")

  const files = await readdir(".")
  const dbFiles = files.filter(file => file.startsWith("local.db"))

  for (const file of dbFiles) {
    try {
      await access(file)
      await unlink(file)
      log.success(`Deleted ${file}`)
    } catch {
      log.info(`${file} not found`)
    }
  }

  // Create an empty database file
  log.info("Creating empty database file...")
  await writeFile("local.db", "")

  outro("Database reset complete!")
}

runScript(reset)
