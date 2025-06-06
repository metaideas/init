import { createEnv } from "@init/env/core"
import * as z from "@init/utils/schema"

import observabilityExpo from "@init/env/observability/expo"

export default createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.string(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  extends: [observabilityExpo],
  runtimeEnv: process.env,
})
