import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export default createEnv({
  client: {
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
})
