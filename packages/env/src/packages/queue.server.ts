import { createEnv } from "@t3-oss/env-core"
import * as z from "@this/validation"

export default createEnv({
  server: {
    QSTASH_URL: z.string().url(),
    QSTASH_TOKEN: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_QUEUE_SERVER === "true",
})
