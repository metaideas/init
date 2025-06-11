import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    DATABASE_URL: z.url(),
    RUN_PRODUCTION_MIGRATIONS: z.stringbool().default(false),
  },
  runtimeEnv: process.env,
})
