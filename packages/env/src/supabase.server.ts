import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

/**
 * Supabase environment variables to be used in a server context.
 */
export default createEnv({
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string(),
    POSTGRES_URL: z.string().url(),
  },
  runtimeEnv: process.env,

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
})
