import { createEnv } from "@init/env/nextjs"
import { vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

// Packages
import observabilityEnv from "@init/env/observability/nextjs"

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
    observabilityEnv,
  ],
})
