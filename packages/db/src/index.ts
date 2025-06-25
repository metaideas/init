import { drizzle } from "drizzle-orm/node-postgres"

import env from "@init/env/db"
import { singleton } from "@init/utils/singleton"

import * as schema from "./schema"

export const db = singleton("db", () =>
  drizzle(env.DATABASE_URL, { schema, casing: "snake_case" })
)
