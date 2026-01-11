import { db as env } from "@init/env/presets"
import { LoggerCategory } from "@init/observability/logger"
import { drizzleLogger } from "@init/observability/logger/integrations"
import { singleton } from "@init/utils/singleton"
import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"
import * as schema from "./schema"

export function connect(url: string) {
  const client = new SQL(url)

  return drizzle({
    casing: "snake_case",
    client,
    logger: drizzleLogger({ category: LoggerCategory.DRIZZLE_ORM }),
    schema,
  })
}

export function database() {
  return singleton("database", () => connect(env().DATABASE_URL))
}

export type Database = ReturnType<typeof database>
