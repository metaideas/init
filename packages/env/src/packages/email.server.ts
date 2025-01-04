import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    EMAIL_FROM: z.string(),
    RESEND_API_KEY: z.string(),
    MOCK_RESEND: z.preprocess(v => v === "true", z.boolean().default(false)),
  },
  runtimeEnv: process.env,
})
