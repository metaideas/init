import { createEnv } from "@init/env"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    VITE_API_URL: z.url(),
  },
  clientPrefix: "VITE_",
  extends: [],
  runtimeEnv: process.env,
  skipValidation: isCI,
})
