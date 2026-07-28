import { createEnv, REACT_PUBLIC_ENV_PREFIX } from "@init/env"
import * as z from "@init/utils/schema"
import { env, isCI } from "std-env"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: REACT_PUBLIC_ENV_PREFIX,
  runtimeEnv: { ...env, ...import.meta.env },
  server: {
    TEST_VAR: z.string(),
  },
  skipValidation: isCI,
})
