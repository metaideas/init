import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/utils/schema"

export default createEnv({
  client: {
    VITE_POSTHOG_HOST: z.string().url(),
    VITE_POSTHOG_API_KEY: z.string(),
  },
  runtimeEnv: {
    VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST,
    VITE_POSTHOG_API_KEY: process.env.VITE_POSTHOG_API_KEY,
  },
  clientPrefix: "VITE_",
  skipValidation: process.env.SKIP_VALIDATION_ANALYTICS_CLIENT === "true",
})
