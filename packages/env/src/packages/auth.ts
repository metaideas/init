import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/utils/schema"

export default createEnv({
  server: {
    AUTH_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_AUTH === "true",
})
