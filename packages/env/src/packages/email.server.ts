import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/validation"

export default createEnv({
  server: {
    EMAIL_FROM: z.string(),
    RESEND_API_KEY: z.string(),
    MOCK_RESEND: z.booleanLike().default(false),
  },
  runtimeEnv: process.env,
})
