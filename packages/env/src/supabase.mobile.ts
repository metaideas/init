import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

/**
 * Supabase environment variables to be used in a mobile context.
 */
export default createEnv({
  client: {
    EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,

  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
})
