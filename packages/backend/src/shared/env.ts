import { createEnv } from "@init/env"
import { auth } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    SITE_URL: z.string(),
  },
  extends: [auth()],
  runtimeEnv: process.env,
  skipValidation: isCI(),
})
