import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string(),
    RUN_PRODUCTION_MIGRATIONS: z
      .string()
      .transform(val => val === "true")
      .default("false"),
  },
  runtimeEnv: process.env,
})
