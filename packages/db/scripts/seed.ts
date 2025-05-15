import { log } from "@clack/prompts"
import { seed } from "drizzle-seed"

import { runProcess, runScript } from "@tooling/helpers"

import { connect } from "@init/db/client"
import * as schema from "@init/db/schema"

async function main() {
  const db = connect()

  log.info("Seeding database...")

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

  log.info("Database seeded!")
}

runScript(main)
