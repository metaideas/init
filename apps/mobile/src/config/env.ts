import { ensureEnv } from "@this/env"

export const { withEnv } = ensureEnv(
  [
    // Import environment variables for all the packages you are using
  ],
  {
    env: process.env,
    clientPrefix: "EXPO_PUBLIC_",
  }
)
