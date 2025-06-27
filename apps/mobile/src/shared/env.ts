import { createEnv } from "@init/env/core"
import { sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [sentry.expo()],
  runtimeEnv: process.env,
})
