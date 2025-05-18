import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    EXPO_PUBLIC_SENTRY_DSN: z.string(),
    EXPO_PUBLIC_SENTRY_URL: z.string(),
    EXPO_PUBLIC_SENTRY_ORG: z.string(),
    EXPO_PUBLIC_SENTRY_PROJECT: z.string(),
  },
  server: {
    SENTRY_AUTH_TOKEN: z.string(),
    SENTRY_DEBUG: z.booleanLike().optional().default(false),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,
})
