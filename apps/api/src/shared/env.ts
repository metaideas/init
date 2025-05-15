import { createEnv, ensureEnv } from "@init/env"
import auth from "@init/env/auth"
import db from "@init/env/db"
import { z } from "@init/utils/schema"

ensureEnv([auth, db])

export default createEnv({
  server: {
    BASE_URL: z.string().url(),
    PORT: z.number().default(3001),
  },
  runtimeEnvStrict: {
    BASE_URL: process.env.BASE_URL,
    PORT: process.env.PORT,
  },
})
