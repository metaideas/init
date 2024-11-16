import env from "@this/env/db"
import envShared from "@this/env/shared"

import * as schema from "#schema/index.ts"

export async function createDatabase() {
  // In development, we'll use the normal Postgres client to connect to our
  // local database.
  if (envShared.IS_DEVELOPMENT) {
    const { drizzle } = await import("drizzle-orm/postgres-js")
    const { default: postgres } = await import("postgres")

    const client = postgres(env.POSTGRES_URL)

    return drizzle({ client, schema, casing: "snake_case" })
  }

  // In production, we'll use Vercel Postgres.
  const { sql } = await import("@vercel/postgres")
  const { drizzle } = await import("drizzle-orm/vercel-postgres")

  return drizzle(sql, {
    schema,
    casing: "snake_case",
  })
}

export const db = await createDatabase()
