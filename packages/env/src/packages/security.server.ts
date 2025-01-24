import { createEnv } from "@t3-oss/env-core"
import * as z from "@this/validation"

export default createEnv({
  server: {
    ARCJET_KEY: z.string(),
  },
  runtimeEnv: process.env,
})
