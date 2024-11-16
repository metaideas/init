import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import { getRuntimeEnv } from "#utils.ts"

const runtimeEnv = await getRuntimeEnv()

/**
 * Supabase environment variables to be used in a web context.
 */
export default createEnv({
  client: {
    PUBLIC_SUPABASE_URL: z.string().url(),
    PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
  clientPrefix: "PUBLIC_",

  runtimeEnv: {
    PUBLIC_SUPABASE_URL:
      runtimeEnv.PUBLIC_SUPABASE_URL || runtimeEnv.EXPO_PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY:
      runtimeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      runtimeEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },

  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
