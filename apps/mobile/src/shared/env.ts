import { createEnv, ensureEnv } from "@init/env"
import * as z from "@init/utils/schema"

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
    EXPO_PUBLIC_API_URL: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  runtimeEnv: process.env,
})
