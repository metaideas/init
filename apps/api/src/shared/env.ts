import { createEnv } from "@init/env/core"
import { node } from "@init/env/presets"
import * as z from "@init/utils/schema"

// Packages
import authEnv from "@init/env/auth"
import { db, sentry } from "@init/utils/env/presets"

export default createEnv({
  server: {
    BASE_URL: z.url(),
    PORT: z.coerce.number().default(3000),
  },
  extends: [
    node(),
    // Packages
    db(),
    sentry(),
    authEnv,
  ],
  runtimeEnv: process.env,
})
