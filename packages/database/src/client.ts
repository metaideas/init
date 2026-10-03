import { log } from "@init/observability/logger"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { ENV } from "#env.generated.ts"
import * as schema from "#schema.ts"

export const pool = new Pool({ connectionString: ENV.DATABASE_URL })

pool.on("error", (error) => {
  log.error({ error, scope: "database" })
})

export const database = drizzle({
  casing: "snake_case",
  client: pool,
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
