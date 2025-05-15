import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    RUN_PRODUCTION_MIGRATIONS: z.booleanLike().default(false),
  },
  runtimeEnv: process.env,
})
