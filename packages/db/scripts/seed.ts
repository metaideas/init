import { log } from "@clack/prompts"
import { runProcess, runScript } from "@tooling/utils"
import { seed } from "drizzle-seed"
import * as schema from "../src/schema"

async function main() {
  const { db } = await import("../src/client")

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
