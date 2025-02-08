import { createNextjsEnv } from "@this/env/helpers"
import { vercel } from "@this/env/presets"
import * as z from "@this/validation"

export default createNextjsEnv({
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string(),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  },
  server: {
    ANALYZE: z.booleanLike().default(false),
  },
  extends: [vercel()],
})
