import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { db } from "@init/utils/env/presets"
import { singleton } from "@init/utils/singleton"

import * as schema from "./schema"

export function connect(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  })

  return drizzle({
    client,
    schema,
    casing: "snake_case",
  })
}

export function database() {
  return singleton("database", () => {
    const env = db()

    return connect(env.DATABASE_URL, env.DATABASE_AUTH_TOKEN)
  })
}

export type Database = ReturnType<typeof database>
