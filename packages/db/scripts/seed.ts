import env from "@this/env/db"
import { drizzle } from "drizzle-orm/libsql"
import { seed } from "drizzle-seed"
import * as schema from "#schema/index.ts"

async function main() {
  const db = drizzle(env.DATABASE_URL)

  await seed(db, schema).refine(f => ({
    users: {
      columns: {
        email: f.email(),
      },

      count: 20,
    },
    organizations: {
      columns: {
        name: f.companyName(),
      },

      count: 20,
    },
  }))
}

main()
