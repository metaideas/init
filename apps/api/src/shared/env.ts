import { createEnv } from "@init/env"
import * as z from "@init/utils/schema"

export default createEnv({
  server: {
    BASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  },
  runtimeEnvStrict: {
    BASE_URL: process.env.BASE_URL,
    PORT: process.env.PORT,
  },
})
