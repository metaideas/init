import { createEnv, EXPO_PUBLIC_ENV_PREFIX } from "@init/env"
import { sentry } from "@init/env/presets"
import { isCI } from "std-env"

createEnv({
  client: {},
  clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
  extends: [sentry.expo()],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
