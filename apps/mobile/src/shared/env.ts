import { createEnv } from "@init/env/core"
import * as z from "@init/utils/schema"

import { sentry, sentryExpo } from "@init/env/presets"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [sentryExpo(), sentry()],
  runtimeEnv: process.env,
})
