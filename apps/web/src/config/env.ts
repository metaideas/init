import { ensureNextjsEnv } from "@this/env"
import db from "@this/env/db.server"
import observabilityServer from "@this/env/observability.server"

export const { withEnv } = ensureNextjsEnv([
  // Import environment variables for all the packages you are using
  db,
  observabilityServer,
])
