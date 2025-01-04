import { ensureNextjsEnv } from "@this/env"
import db from "@this/env/db.server"
import kv from "@this/env/kv.server"
import observabilityServer from "@this/env/observability.server"
import observabilityWeb from "@this/env/observability.web"

export const { withEnv } = ensureNextjsEnv([
  // Import environment variables for all the packages you are using
  db,
  kv,
  observabilityWeb,
  observabilityServer,
])
