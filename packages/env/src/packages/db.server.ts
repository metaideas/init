import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export default createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    RUN_PRODUCTION_MIGRATIONS: z
      .string()
      .transform(val => val === "true")
      .default("false"),
  },
  runtimeEnv: process.env,
})
