import { createEnv, ensureEnv } from "@this/env/helpers"
import * as z from "@this/utils/schema"

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
    EXPO_PUBLIC_API_URL: z.string().url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,
})
