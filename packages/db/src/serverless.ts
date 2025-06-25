import { neon } from "@neondatabase/serverless"
import type { DrizzleConfig } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"

import env from "@init/env/db"
import { isDevelopment } from "@init/utils/environment"
import { singleton } from "@init/utils/singleton"

import * as schema from "./schema"

const config: DrizzleConfig = {
  casing: "snake_case",
}

export const db = singleton("db-serverless", () => {
  // In development, we can't use the HTTP driver so we'll connect using TCP
  if (isDevelopment) {
    return drizzlePg(env.DATABASE_URL, { ...config, schema })
  }

  const sql = neon(env.DATABASE_URL)
  return drizzle(sql, { ...config, schema })
})
