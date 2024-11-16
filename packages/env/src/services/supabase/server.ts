import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import { getRuntimeEnv } from "#utils.ts"

const runtimeEnv = await getRuntimeEnv()

/**
 * Supabase environment variables to be used in a server context.
 */
export default createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string(),
  },
  runtimeEnv,

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
})
