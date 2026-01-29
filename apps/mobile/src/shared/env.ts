import { createEnv } from "@init/env"
import { sentry } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [sentry.expo()],
  runtimeEnv: process.env,
  skipValidation: isCI(),
})
