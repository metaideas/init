import { db } from "@init/env/presets"
import { singleton } from "@init/utils/singleton"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

export function connect(url: string) {
  const client = postgres(url)

  return drizzle({
    client,
    schema,
    casing: "snake_case",
  })
}

export function database() {
  return singleton("database", () => {
    const env = db()

    return connect(env.DATABASE_URL)
  })
}

export type Database = ReturnType<typeof database>
