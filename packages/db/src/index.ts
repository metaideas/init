import { drizzle } from "drizzle-orm/node-postgres"

import env from "@init/env/db"
import { remember } from "@init/utils/remember"

import * as schema from "./schema"

export const db = remember("db", () =>
  drizzle(env.DATABASE_URL, { schema, casing: "snake_case" })
)
