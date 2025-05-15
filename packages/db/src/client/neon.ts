import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"

import env from "@init/env/db"

import * as schema from "../schema"

export function createNeonClient() {
  neonConfig.webSocketConstructor = ws
  neonConfig.poolQueryViaFetch = true

  const pool = new Pool({ connectionString: env.DATABASE_URL })

  return drizzle(pool, { schema, casing: "snake_case" })
}
