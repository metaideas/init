import { createNextjsEnv } from "@this/env"
import { vercel } from "@this/env/presets"
import * as z from "@this/utils/schema"

export default createNextjsEnv({
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  server: {
    ANALYZE: z.booleanLike().default(false),

    // Google Sign In
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    // Github Sign In
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string(),
    NEXT_PUBLIC_API_URL: z.string().optional(),
  },
  extends: [vercel()],
})
