import { log } from "@init/observability/logger"
import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"
import { ENV } from "#env.generated.ts"
import * as schema from "#schema.ts"

export const database = drizzle({
  casing: "snake_case",
  client: new SQL(ENV.DATABASE_URL),
  logger: {
    logQuery(query, params) {
      log.debug({ params, query, scope: "drizzle" })
    },
  },
  schema,
})

export function checkIsLocalDatabase(url: string) {
  return url.includes("localhost") || url.includes("127.0.0.1")
}

export type Database = typeof database
