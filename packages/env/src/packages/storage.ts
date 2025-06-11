import { createEnv } from "@t3-oss/env-core"

import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    UPLOADTHING_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
})
