import { createEnv } from "@init/env"
import { arcjet, auth, db, inngest, kv, node, sentry } from "@init/env/presets"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"

export default createEnv({
  extends: [
    node(),
    // Packages
    auth(),
    auth.providers.github(),
    auth.providers.google(),
    db(),
    kv(),
    arcjet(),
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
  skipValidation: isCI(),
})
