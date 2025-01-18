import { createEnv, ensureEnv } from "@this/env"
import { z } from "zod"

const local = createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  clientPrefix: "EXPO_PUBLIC_",
})

export const { withEnv } = ensureEnv(
  local,
  [
    // Import environment variables for all the packages you are using
  ],
  {
    env: process.env,
    clientPrefix: "EXPO_PUBLIC_",
  }
)

export default local
