import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { db as env } from "@init/env/presets"
import { prompt, runScript } from "@tooling/helpers"
import { reset } from "drizzle-seed"

async function main() {
  prompt.log.step("Resetting database...")

  if (!checkIsLocalDatabase(env().DATABASE_URL)) {
    prompt.log.error("Cannot reset production database")
    process.exit(1)
  }
  const db = database()

  prompt.log.step("Dropping all tables")

  await reset(db, schema)

  prompt.outro("All tables dropped successfully. Database reset complete!")
}

void runScript(main)
