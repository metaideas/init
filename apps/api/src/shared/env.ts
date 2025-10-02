import { createEnv } from "@init/env"
import { auth, db, node, sentry, upstash } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
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
    upstash.redis(),
  ],
  runtimeEnv: process.env,
  skipValidation: isCI(),
})
