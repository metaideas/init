import { createEnv } from "@init/env"
import { auth, db, inngest, kv, sentry } from "@init/env/presets"
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
    PORT: z.coerce.number().default(3000),
  },
  skipValidation: isCI,
})
