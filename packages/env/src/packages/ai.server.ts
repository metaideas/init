import { createEnv } from "@t3-oss/env-core"
import * as z from "@this/validation"

export default createEnv({
  server: {
    ENABLE_OPENAI: z.boolean(),
    OPENAI_API_KEY: z.conditional(
      process.env.ENABLE_OPENAI === "true",
      z.string()
    ),
    ENABLE_ANTHROPIC: z.boolean(),
    ANTHROPIC_API_KEY: z.conditional(
      process.env.ENABLE_ANTHROPIC === "true",
      z.string()
    ),
    ENABLE_DEEPSEEK: z.boolean(),
    DEEPSEEK_API_KEY: z.conditional(
      process.env.ENABLE_DEEPSEEK === "true",
      z.string()
    ),
    UPSTASH_VECTOR_REST_URL: z.string().url(),
    UPSTASH_VECTOR_REST_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.SKIP_VALIDATION_AI_SERVER === "true",
})
