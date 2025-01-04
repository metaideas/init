import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    OPENAI_API_KEY: z.string(),
    ANTHROPIC_API_KEY: z.string(),
    UPSTASH_VECTOR_REST_URL: z.string().url(),
    UPSTASH_VECTOR_REST_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
})
