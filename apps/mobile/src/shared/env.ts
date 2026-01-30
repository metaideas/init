import { createEnv } from "@init/env"
import { sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [sentry.expo()],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
