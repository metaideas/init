import { createEnv } from "@t3-oss/env-core"
import { parseStringToBoolean } from "@this/validation/env"
import { z } from "zod"

export default createEnv({
  server: {
    EMAIL_FROM: z.string(),
    RESEND_API_KEY: z.string(),
    MOCK_RESEND: parseStringToBoolean.default(false),
  },
  runtimeEnv: process.env,
})
