import { reset } from "drizzle-seed"

import { prompt, runScript } from "@tooling/helpers"

import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { db as env } from "@init/utils/env/presets"

async function main() {
  prompt.log.step("Resetting database...")

  if (!checkIsLocalDatabase(env().DATABASE_URL)) {
    prompt.log.error("Cannot reset production database")
    process.exit(1)
  }
  const db = database()

  try {
    prompt.log.step("Dropping all tables")

    // @ts-expect-error - Type error with drizzle-seed and LibSQL
    await reset(db, schema)

    prompt.log.success(
      "All tables dropped successfully. Database reset complete!"
    )
  } catch (error) {
    prompt.log.error("Error dropping tables:")
    console.error(error)
    process.exit(1)
  }
}

runScript(main)
