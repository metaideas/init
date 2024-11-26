import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true",
  emptyStringAsUndefined: process.env.NODE_ENV === "production",
})
