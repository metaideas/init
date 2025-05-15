import env from "@init/env/db"
import { remember } from "@init/utils/remember"

import { createNeonClient } from "./neon"
import { createPostgresClient } from "./postgres"

export function connect() {
  // If we are using a local database, we use postgres.js
  if (env.DATABASE_URL?.includes("localhost")) {
    return createPostgresClient()
  }

  // Otherwise, we use the Neon driver
  return createNeonClient()
}

const database = remember("database", connect)

export default database
