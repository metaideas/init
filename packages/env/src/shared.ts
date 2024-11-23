import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import { getRuntimeEnv } from "#utils.ts"

const runtimeEnv = await getRuntimeEnv()

export default createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    ENVIRONMENT: z
      .enum(["development", "production", "test"])
      .default("development"),
    IS_DEVELOPMENT: z.boolean().default(true),
    IS_PRODUCTION: z.boolean().default(false),
    IS_TEST: z.boolean().default(false),
  },
  server: {},
  runtimeEnv: {
    ...runtimeEnv,
    IS_DEVELOPMENT: runtimeEnv.NODE_ENV === "development",
    IS_PRODUCTION: runtimeEnv.NODE_ENV === "production",
    IS_TEST: runtimeEnv.NODE_ENV === "test",
  },
  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
