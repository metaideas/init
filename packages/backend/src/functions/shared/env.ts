import { createEnv } from "@init/env"
import { auth } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  extends: [auth()],
  runtimeEnv: process.env,
  server: {
    CONVEX_SITE_URL: z.string(),
  },
  skipValidation: isCI,
})
