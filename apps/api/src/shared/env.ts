import { createEnv, ensureEnv } from "@this/env"
import auth from "@this/env/auth"
import db from "@this/env/db"
import email from "@this/env/email"
import kv from "@this/env/kv"
import queue from "@this/env/queue"
import { z } from "@this/utils/schema"

ensureEnv([auth, db, email, kv, queue])

export default createEnv({
  server: {
    BASE_URL: z.string().url(),
  },
  runtimeEnvStrict: {
    BASE_URL: process.env.BASE_URL,
  },
})
