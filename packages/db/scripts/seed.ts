import { seed } from "drizzle-seed"

import { prompt, runProcess, runScript } from "@tooling/helpers"

import { db } from "@init/db"
import * as schema from "@init/db/schema"

async function main() {
  prompt.log.info("Seeding database...")

  await runProcess("drizzle-kit", ["push"])

  console.time("Seeded database")

  await seed(db, schema).refine(f => ({
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
  console.timeEnd("Seeded database")

  prompt.log.info("Database seeded!")
}

runScript(main)
