import { createEnv } from "@t3-oss/env-core"
import * as z from "../helpers/schema"

export const db = () =>
  createEnv({
    server: {
      DATABASE_URL: z.url(),
      DATABASE_AUTH_TOKEN: z.string(),
      RUN_PRODUCTION_MIGRATIONS: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
  })
