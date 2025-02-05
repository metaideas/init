import { intro, log, outro } from "@clack/prompts"
import { runScript } from "@tooling/utils"
import { sql } from "drizzle-orm"

async function reset() {
  intro("Resetting database...")

  const { db } = await import("../src")
  const { default: env } = await import("@this/env/db.server")

  if (env.DATABASE_URL?.includes("neon")) {
    log.error("Cannot reset production database")
    process.exit(1)
  }

  try {
    log.info("Dropping all tables and enums...")

    await db.execute(sql`DROP SCHEMA public CASCADE;`)
    await db.execute(sql`CREATE SCHEMA public;`)

    log.success("All tables and enums dropped successfully")
  } catch (error) {
    log.error("Error dropping tables and enums:")
    console.error(error)
    process.exit(1)
  }

  outro("Database reset complete!")
}

runScript(reset)
