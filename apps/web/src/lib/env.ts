import { createNextjsEnv, ensureNextjsEnv } from "@this/env"
import db from "@this/env/db.server"
import kv from "@this/env/kv.server"
import observabilityServer from "@this/env/observability.server"
import observabilityWeb from "@this/env/observability.web"
import { z } from "zod"

const local = createNextjsEnv({
  shared: {
    NEXT_PUBLIC_DOMAIN: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
})

export const { withEnv } = ensureNextjsEnv(local, [
  // Import environment variables for all the packages you are using
  db,
  kv,
  observabilityWeb,
  observabilityServer,
])

// Export the local environment variables for use in other files
export default local
