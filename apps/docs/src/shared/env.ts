import { createNextjsEnv } from "@init/env"
import { vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

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
