import { createNextjsEnv, ensureNextjsEnv } from "@this/env"
import observabilityServer from "@this/env/observability.server"
import observabilityWeb from "@this/env/observability.web"
import * as z from "@this/validation"

const local = createNextjsEnv({
  shared: {
    NEXT_PUBLIC_DOMAIN: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
})

export const { withEnv } = ensureNextjsEnv(local, [
  // Import environment variables for all the packages you are using
  observabilityWeb,
  observabilityServer,
])

// Export the local environment variables for use in other files
export default local
