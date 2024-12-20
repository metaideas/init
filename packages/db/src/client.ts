import { createClient } from "@libsql/client"
import env from "@this/env/db.server"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(client, { schema, casing: "snake_case" })
