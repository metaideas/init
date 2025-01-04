import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
})
