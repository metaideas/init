import { neon, neonConfig } from "@neondatabase/serverless"
import envCore from "@this/env/core"
import env from "@this/env/db.server"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

// Configuring Neon for local development
if (envCore.IS_DEVELOPMENT) {
  neonConfig.fetchEndpoint = host => {
    const [protocol, port] =
      host === "db.localtest.me" ? ["http", 4444] : ["https", 443]
    return `${protocol}://${host}:${port}/sql`
  }

  const connectionStringUrl = new URL(env.DATABASE_URL)

  neonConfig.useSecureWebSocket =
    connectionStringUrl.hostname !== "db.localtest.me"

  neonConfig.wsProxy = host =>
    host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`
}

const sql = neon(env.DATABASE_URL)

export const db = drizzle(sql, { schema, casing: "snake_case" })
