import env from "@this/env/db"
import { runProcess, runScript } from "@tooling/utils"
import { drizzle } from "drizzle-orm/libsql"
import { seed } from "drizzle-seed"
import * as schema from "#schema/index.ts"

async function main() {
  const db = drizzle(env.DATABASE_URL, { casing: "snake_case" })

  await runProcess("drizzle-kit", ["push"])

  console.info("Seeding database...")
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
    verifications: {
      id: f.intPrimaryKey(),
    },
  }))
  console.timeEnd("Seeded database")
}

runScript(main)
