import { createEnv, ensureEnv } from "@this/env"

const local = createEnv({
  client: {},
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
