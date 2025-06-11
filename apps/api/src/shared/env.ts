import { createEnv } from "@init/env/core"
import { node } from "@init/env/presets"
import * as z from "@init/utils/schema"

// Packages
import authEnv from "@init/env/auth"
import dbEnv from "@init/env/db"
import observabilityEnv from "@init/env/observability/server"

export default createEnv({
  server: {
    BASE_URL: z.url(),
    PORT: z.coerce.number().default(3000),
  },
  extends: [
    node(),

    // Packages
    authEnv,
    dbEnv,
    observabilityEnv,
  ],
  runtimeEnv: process.env,
})
