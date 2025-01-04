import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    ARCJET_KEY: z.string(),
  },
  runtimeEnv: process.env,
})
