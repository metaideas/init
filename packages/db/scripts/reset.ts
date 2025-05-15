import { log } from "@clack/prompts"
import { reset } from "drizzle-seed"

import { runScript } from "@tooling/helpers"

import { connect } from "@init/db/client"
import * as schema from "@init/db/schema"

async function main() {
  log.step("Resetting database...")

  const { default: env } = await import("@init/env/db")

  if (env.DATABASE_URL?.includes("https")) {
    log.error("Cannot reset production database")
    process.exit(1)
  }

  try {
    log.step("Dropping all tables")

    await reset(connect(), schema)

    log.success("All tables dropped successfully. Database reset complete!")
  } catch (error) {
    log.error("Error dropping tables:")
    console.error(error)
    process.exit(1)
  }
}

runScript(main)
