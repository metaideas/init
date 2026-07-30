import { createEnv } from "@init/env"
import { auth, db, inngest, kv, resend, sentry } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { isCI } from "std-env"

export default createEnv({
  extends: [
    // Packages
    auth(),
    auth.providers.github(),
    auth.providers.google(),
    db(),
    kv(),
    inngest(),
    resend(),
    sentry.server(),
  ],
  runtimeEnv: process.env,
  server: {
    ALLOWED_API_ORIGINS: z
      .string()
      .pipe(
        z.preprocess(
          (origins) => origins.split(",").map((origin) => origin.trim()),
          z.array(z.string())
        )
      ),
    BASE_URL: z.url(),
    FILES_API_SECRET: z.string().min(32),
    PORT: z.coerce.number().default(3000),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    S3_ENDPOINT: z.url().optional(),
    S3_FORCE_PATH_STYLE: z.stringbool().default(false),
    S3_REGION: z.string().default("us-east-1"),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
  },
  skipValidation: isCI,
})
