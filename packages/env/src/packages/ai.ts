import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    OPENAI_API_KEY: z.string().optional(),

    UPSTASH_VECTOR_REST_TOKEN: z.string(),
    UPSTASH_VECTOR_REST_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_AI === "true",
})
