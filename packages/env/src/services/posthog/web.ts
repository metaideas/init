import { createEnv } from "@t3-oss/env-nextjs"
import { getRuntimeEnv } from "@this/common/utils/runtime"
import { z } from "zod"

const runtimeEnv = await getRuntimeEnv()

/**
 * Posthog environment variables to be used in a Next.js project.
 */
export default createEnv({
  client: {
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  },
  runtimeEnv,
  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
