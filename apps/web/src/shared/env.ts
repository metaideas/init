import { createEnv } from "@init/env"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnv: { ...env, ...import.meta.env },
  server: {
    TEST_VAR: z.string(),
  },
  skipValidation: isCI,
})
