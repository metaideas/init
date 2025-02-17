import { createEnv } from "@t3-oss/env-core"

import * as z from "@this/utils/schema"

export default createEnv({
  server: {
    NODE_ENV: z.env(),
  },
  runtimeEnv: process.env,
})
