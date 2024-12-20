import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  client: {
    EXPO_PUBLIC_POSTHOG_HOST: z.string().url(),
    EXPO_PUBLIC_POSTHOG_KEY: z.string(),
  },
  runtimeEnv: process.env,
  clientPrefix: "EXPO_PUBLIC_",
})
