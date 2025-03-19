import { log } from "@clack/prompts"
import { reset } from "drizzle-seed"

import { runScript } from "@tooling/helpers"

import * as schema from "../src/schema"

async function main() {
  log.step("Resetting database...")

  const { db } = await import("../src")
  const { default: env } = await import("@init/env/db")

  if (env.DATABASE_URL?.includes("https")) {
    log.error("Cannot reset production database")
    process.exit(1)
  }

  try {
    log.step("Dropping all tables")

    // @ts-expect-error -- TODO: find out if this error is due to drizzle-seed or
    // the schema
    await reset(db, schema)

    log.success("All tables dropped successfully. Database reset complete!")
  } catch (error) {
    log.error("Error dropping tables:")
    console.error(error)
    process.exit(1)
  }
}

runScript(main)
