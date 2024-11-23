import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

import envShared from "#shared.ts"
import { getRuntimeEnv } from "#utils.ts"

const runtimeEnv = await getRuntimeEnv()

/**
 * Database environment variables.
 */
export default createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string(),
  },
  runtimeEnv,
  extends: [envShared],

  skipValidation:
    runtimeEnv.SKIP_ENV_VALIDATION === "true" || runtimeEnv.CI === "true",
  emptyStringAsUndefined: runtimeEnv.NODE_ENV === "production",
})
