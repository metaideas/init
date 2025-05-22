import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"

import envCore from "@init/env/core"
import env from "@init/env/db"
import { remember } from "@init/utils/remember"

import * as schema from "./schema"

export const db = remember("db-serverless", () => {
  // In development, we can't use the HTTP driver so we'll connect using TCP
  if (envCore.NODE_ENV === "development") {
    return drizzlePg(env.DATABASE_URL, { schema, casing: "snake_case" })
  }

  return drizzleNeon(env.DATABASE_URL, { schema, casing: "snake_case" })
})
