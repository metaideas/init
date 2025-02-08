import { createEnv, ensureEnv } from "@this/env/helpers"
import * as z from "@this/validation"

ensureEnv(
  [
    // Import environment variables for all the packages you are using
  ],
  {
    clientPrefix: "EXPO_PUBLIC_",
    env: process.env,
  }
)

export default createEnv({
  client: {
    EXPO_PUBLIC_SERVER_URL: z.string().url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,
})
