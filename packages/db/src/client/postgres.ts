import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import env from "@init/env/db"

import * as schema from "../schema"

export function createPostgresClient() {
  const sql = postgres(env.DATABASE_URL, { prepare: false })

  return drizzle(sql, { schema, casing: "snake_case" })
}
