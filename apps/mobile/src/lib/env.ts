import { createEnv, ensureEnv } from "@this/env/helpers"
import * as z from "@this/validation"

const app = createEnv({
  client: {
    EXPO_PUBLIC_SERVER_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  clientPrefix: "EXPO_PUBLIC_",
})

ensureEnv(
  [
    app,
    // Import environment variables for all the packages you are using
  ],
  {
    env: process.env,
    clientPrefix: "EXPO_PUBLIC_",
  }
)

export default app
