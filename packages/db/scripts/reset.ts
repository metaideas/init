import { access, readdir, unlink, writeFile } from "node:fs/promises"
import { runScript } from "@tooling/utils"

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

  // Create an empty database file
  console.info("Creating empty database file...")
  await writeFile("local.db", "")
}

runScript(reset)
