import { access, readdir, unlink } from "node:fs/promises"
import { runProcess, runScript } from "@tooling/utils"

async function reset() {
  const files = await readdir(".")
  const dbFiles = files.filter(file => file.startsWith("local.db"))

  for (const file of dbFiles) {
    try {
      await access(file)
      await unlink(file)
      console.info(`Deleted ${file}`)
    } catch {
      console.info(`${file} not found`)
    }
  }

  // Create the database and push the schema
  await runProcess("turso", ["dev", "--db-file=local.db"])
}

runScript(reset)
