import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/utils/schema"

export default createEnv({
  client: {
    EXPO_PUBLIC_POSTHOG_HOST: z.string().url(),
    EXPO_PUBLIC_POSTHOG_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
  clientPrefix: "EXPO_PUBLIC_",
  skipValidation: process.env.SKIP_VALIDATION_ANALYTICS_MOBILE === "true",
})
