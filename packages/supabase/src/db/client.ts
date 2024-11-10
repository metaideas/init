import { isDevelopment } from "@this/common/variables"
import env from "@this/env/supabase.server"

import * as schema from "#db/schema/index.ts"

async function createDatabase() {
  // In development, we'll use the normal Postgres client to connect to our
  // local database.
  if (isDevelopment) {
    const { drizzle } = await import("drizzle-orm/postgres-js")
    const { default: postgres } = await import("postgres")

    const client = postgres(env.POSTGRES_URL)

    return drizzle({ client, schema, casing: "snake_case" })
  }

  const { sql } = await import("@vercel/postgres")
  const { drizzle } = await import("drizzle-orm/vercel-postgres")

  return drizzle({
    client: sql,
    schema,
    casing: "snake_case",
  })
}

const db = await createDatabase()

export default db
