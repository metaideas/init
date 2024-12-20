import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  client: {
    EXPO_PUBLIC_BETTER_AUTH_URL: z.string().url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: {
    EXPO_PUBLIC_BETTER_AUTH_URL: process.env.EXPO_PUBLIC_BETTER_AUTH_URL,
  },
})
