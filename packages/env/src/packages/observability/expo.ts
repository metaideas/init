import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/utils/schema"

export default createEnv({
  client: {
    EXPO_PUBLIC_SENTRY_DSN: z.string(),
    EXPO_PUBLIC_SENTRY_URL: z.string(),
    EXPO_PUBLIC_SENTRY_ORGANIZATION: z.string(),
    EXPO_PUBLIC_SENTRY_PROJECT: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: {
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_SENTRY_URL: process.env.EXPO_PUBLIC_SENTRY_URL,
    EXPO_PUBLIC_SENTRY_ORGANIZATION:
      process.env.EXPO_PUBLIC_SENTRY_ORGANIZATION,
    EXPO_PUBLIC_SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
  },
})
