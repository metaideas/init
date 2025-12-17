import { SQL } from "bun"
import { db as env } from "@init/env/presets"
import { drizzleLogger } from "@init/observability/logger/integrations"
import { singleton } from "@init/utils/singleton"
import { drizzle } from "drizzle-orm/bun-sql"
import * as schema from "./schema"

export function connect(url: string) {
  const client = new SQL(url)

  return drizzle({
    client,
    schema,
    casing: "snake_case",
    logger: drizzleLogger(),
  })
}

export function database() {
  return singleton("database", () => connect(env().DATABASE_URL))
}

export type Database = ReturnType<typeof database>
