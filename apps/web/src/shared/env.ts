import { createEnv } from "@init/env"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  client: {
    PUBLIC_API_URL: z.url(),
  },
  clientPrefix: "PUBLIC_",
  runtimeEnv: import.meta.env,
  server: {
    TEST_VAR: z.string(),
  },
  skipValidation: isCI(),
})
