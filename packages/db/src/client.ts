import { log } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"
import { ENV } from "#env.generated.ts"
import * as schema from "#schema.ts"

export function connect(url: string) {
  const client = new SQL(url)

  return drizzle({
    casing: "snake_case",
    client,
    logger: {
      logQuery(query, params) {
        log.debug({ params, query, scope: "drizzle" })
      },
    },
    schema,
  })
}

export function database() {
  return singleton("database", () => connect(ENV.DATABASE_URL))
}

export function checkIsLocalDatabase(url: string) {
  return url.includes("localhost") || url.includes("127.0.0.1")
}

export type Database = ReturnType<typeof database>
