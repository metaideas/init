import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { WebSocket } from "ws"

import envCore from "@this/env/core.server"
import env from "@this/env/db.server"

import * as schema from "./schema"

// Configuring Neon for local development
if (envCore.NODE_ENV === "development") {
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

neonConfig.webSocketConstructor = WebSocket
neonConfig.poolQueryViaFetch = true

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema, casing: "snake_case" })
