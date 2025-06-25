import { createEnv } from "@init/env/core"
import * as z from "@init/utils/schema"

// Packages
import { auth, db, node, sentry } from "@init/utils/env/presets"

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
    sentry(),
  ],
  runtimeEnv: process.env,
})
