import { createEnv } from "@init/env/core"
// Packages
import { auth, db, node, sentry, upstashRedis } from "@init/env/presets"
import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    BASE_URL: z.url(),
    PORT: z.coerce.number().default(3000),
  },
  extends: [
    node(),
    // Packages
    auth(),
    db(),
    sentry.server(),
    upstashRedis(),
  ],
  runtimeEnv: process.env,
})
