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
          // Bound parameters carry values such as session tokens and password hashes, which
          // field-name redaction cannot recognize, so only the parameterized query is logged.
          logQuery(query) {
            logger.debug({ query, scope: "drizzle" })
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
