import { createEnv } from "@t3-oss/env-core"
import { getRuntimeEnv } from "@this/common/utils/runtime"
import { z } from "zod"

const runtimeEnv = await getRuntimeEnv()

/**
 * PostHog environment variables to be used in a mobile context.
 */
export default createEnv({
  client: {
    EXPO_PUBLIC_POSTHOG_HOST: z.string().url(),
    EXPO_PUBLIC_POSTHOG_KEY: z.string(),
  },
  runtimeEnv,
  clientPrefix: "EXPO_PUBLIC_",
  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
