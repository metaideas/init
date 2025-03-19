import { createEnv } from "@t3-oss/env-nextjs"

import * as z from "@init/utils/schema"

import envServer from "./server"

export default createEnv({
  extends: [envServer],
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  skipValidation: process.env.SKIP_VALIDATION_OBSERVABILITY_NEXTJS === "true",
})
