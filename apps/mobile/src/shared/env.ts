import { createEnv, EXPO_PUBLIC_ENV_PREFIX } from "@init/env"
import { sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.url(),
  },
  clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
  extends: [sentry.expo()],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
