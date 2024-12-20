import { ensureNextjsEnv } from "@this/env"
import db from "@this/env/db.server"

export const { withEnv } = ensureNextjsEnv([
  // Import environment variables for all the packages you are using
  db,
])
