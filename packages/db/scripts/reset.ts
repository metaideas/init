import { reset } from "drizzle-seed"

import { prompt, runScript } from "@tooling/helpers"

import { connect } from "@init/db/client"
import * as schema from "@init/db/schema"

async function main() {
  prompt.log.step("Resetting database...")

  const { default: env } = await import("@init/env/db")

  if (env.DATABASE_URL?.includes("https")) {
    prompt.log.error("Cannot reset production database")
    process.exit(1)
  }

  try {
    prompt.log.step("Dropping all tables")

    await reset(connect(), schema)

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
