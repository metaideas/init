import { database } from "@init/db/client"
import * as schema from "@init/db/schema"
import { prompt, runProcess, runScript } from "@tooling/helpers"
import { seed } from "drizzle-seed"

async function main() {
  prompt.log.info("Seeding database...")

  const db = database()

  await runProcess("drizzle-kit", ["push"])

  const start = performance.now()

  // @ts-expect-error - Type error with drizzle-seed and LibSQL
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

  prompt.outro(`Database seeded in ${end - start}ms`)
}

void runScript(main)
