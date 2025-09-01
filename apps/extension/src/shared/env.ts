import { createEnv } from "@init/env/core"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    VITE_API_URL: z.string(),
  },
  clientPrefix: "VITE_",
  extends: [],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
