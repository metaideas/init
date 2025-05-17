import { createNextjsEnv } from "@init/env"
import { vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

export default createNextjsEnv({
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  server: {
    ANALYZE: z.booleanLike().default(false),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string(),
    NEXT_PUBLIC_API_URL: z.string().optional(),
  },
  extends: [vercel()],
})
