import { createEnv, ensureEnv } from "@this/env"
import * as z from "@this/validation"

const local = createEnv({
  client: {
    EXPO_PUBLIC_SERVER_URL: z.string().url(),
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
