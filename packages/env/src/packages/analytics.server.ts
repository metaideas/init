import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/validation"

export default createEnv({
  server: {
    POSTHOG_HOST: z.string().url(),
    POSTHOG_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_ANALYTICS_SERVER === "true",
})
