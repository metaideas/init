import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { db as env } from "@init/env/presets"
import consola from "consola"
import { reset } from "drizzle-seed"

const CONFIRM_PROMPT = "reset production database"

async function main() {
  consola.info("Running the database reset script")

  if (!checkIsLocalDatabase(env().DATABASE_URL)) {
    consola.warn("You are about to reset the production database. This action is irreversible.")
    consola.box("DATABASE_URL", env().DATABASE_URL)

    const confirm = await consola.prompt("Are you sure you want to proceed?", {
      type: "confirm",
    })

    if (!confirm) {
      consola.error("Database reset cancelled")
      process.exit(0)
    }

    const confirmPrompt = await consola.prompt("Type 'reset production database' to confirm", {
      type: "text",
    })

    if (confirmPrompt !== CONFIRM_PROMPT) {
      consola.error("Database reset cancelled")
      process.exit(0)
    }
  }

  const db = database()

  consola.start("Resetting database...")

  await reset(db, schema)

  consola.success("All data removed successfully. Database reset complete!")
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    consola.fatal(error)
    process.exit(1)
  })
