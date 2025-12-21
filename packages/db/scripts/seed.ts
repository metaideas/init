import Bun from "bun"
import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { db as env } from "@init/env/presets"
import consola from "consola"
import { seed } from "drizzle-seed"

const CONFIRM_PROMPT = "seed production database"

async function main() {
  consola.info("Running the database seed script")

  if (!checkIsLocalDatabase(env().DATABASE_URL)) {
    consola.warn(
      "You are about to seed the production database. This action will add data to the database."
    )
    consola.box("DATABASE_URL", env().DATABASE_URL)

    const confirm = await consola.prompt("Are you sure you want to proceed?", {
      type: "confirm",
    })

    if (!confirm) {
      consola.error("Database seed cancelled")
      process.exit(0)
    }

    const confirmPrompt = await consola.prompt("Type 'seed production database' to confirm", {
      type: "text",
    })

    if (confirmPrompt !== CONFIRM_PROMPT) {
      consola.error("Database seed cancelled")
      process.exit(0)
    }
  }

  const db = database()

  consola.start("Pushing database schema...")
  await Bun.$`drizzle-kit push`
  consola.success("Database schema pushed")

  consola.start("Seeding database...")

  const start = performance.now()

  await seed(db, schema).refine((f) => ({
    users: {
      columns: {
        name: f.fullName(),
        role: f.valuesFromArray({
          values: ["admin", "user"],
        }),
      },

      count: 10,
      with: {
        accounts: 1,
      },
    },
    organizations: {
      columns: {
        name: f.companyName(),
      },
      count: 10,
    },
    verifications: {
      columns: {
        id: f.intPrimaryKey(),
      },
    },
  }))

  const end = performance.now()

  consola.success(`Database seeded successfully in ${Math.round(end - start)}ms`)
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    consola.fatal(error)
    process.exit(1)
  })
