import type { Logger } from "@init/core/services/logging"
import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"
import * as schema from "#schema.ts"

export function createDatabase({ logger, url }: { url: string; logger?: Logger }) {
  return drizzle({
    casing: "snake_case",
    client: new SQL(url),
    logger: logger
      ? {
          logQuery(query, params) {
            logger.debug({ params, query, scope: "drizzle" })
          },
        }
      : false,
    schema,
  })
}

export function checkIsLocalDatabase(url: string) {
  return url.includes("localhost") || url.includes("127.0.0.1")
}

export type Database = ReturnType<typeof createDatabase>
