import { createEnv } from "@t3-oss/env-nextjs"

import * as z from "@this/utils/schema"
import server from "./server"

export default createEnv({
  extends: [server],
  client: {
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_POSTHOG_API_KEY: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
  },
  skipValidation: process.env.SKIP_VALIDATION_ANALYTICS_NEXTJS === "true",
})
