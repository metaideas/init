import { createEnv } from "@init/env"
import { auth } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  extends: [auth()],
  runtimeEnv: process.env,
  server: {
    CONVEX_SITE_URL: z.string(),
  },
  skipValidation: isCI(),
})
