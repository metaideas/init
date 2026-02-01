import { createEnv, getRuntimeEnv } from "@init/env"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnv: getRuntimeEnv(),
  server: {
    TEST_VAR: z.string(),
  },
  skipValidation: isCI,
})
