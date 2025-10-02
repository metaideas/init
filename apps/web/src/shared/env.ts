import { createEnv } from "@init/env"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    TEST_VAR: z.string(),
  },
  client: {
    PUBLIC_API_URL: z.string(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnv: import.meta.env,
  skipValidation: isCI(),
})
