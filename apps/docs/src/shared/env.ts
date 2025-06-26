import { createEnv } from "@init/env/nextjs"
import { vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

// Packages
import { sentry } from "@init/env/presets"

export default createEnv({
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  },
  server: {
    ANALYZE: z.stringbool().default(false),
  },
  extends: [
    vercel(),

    // Packages
    sentry(),
  ],
})
