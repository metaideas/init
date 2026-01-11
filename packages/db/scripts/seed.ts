// oxlint-disable no-console - We use console.log for logging in scripts

import { database } from "@init/db/client"
import { checkIsLocalDatabase } from "@init/db/helpers"
import * as schema from "@init/db/schema"
import { db as env } from "@init/env/presets"
import Bun from "bun"
import { seed } from "drizzle-seed"

async function main() {
  console.log("\n🌱 Database Seed\n")

  if (!checkIsLocalDatabase(env().DATABASE_URL)) {
    throw new Error(
      "Cannot seed a non-local database. This script only works with local databases."
    )
  }

  const db = database()

  console.log("   Pushing database schema...\n")
  await Bun.$`drizzle-kit push`
  console.log("✅ Database schema pushed\n")

  console.log("   Seeding database...\n")

  const start = performance.now()

  await seed(db, schema).refine((f) => ({
    organizations: {
      columns: {
        name: f.companyName(),
      },
      count: 10,
    },
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
    verifications: {
      columns: {
        id: f.intPrimaryKey(),
      },
    },
  }))

  const end = performance.now()

  console.log(`✅ Database seeded successfully in ${Math.round(end - start)}ms\n`)
}

void main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n✖  ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
