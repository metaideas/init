import { createEnv } from "@init/env/nextjs"
import { node, vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"

import authEnv from "@init/env/auth"
import dbEnv from "@init/env/db"
import kvEnv from "@init/env/kv"
import queueEnv from "@init/env/queue"

export default createEnv({
  experimental__runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  server: {
    ANALYZE: z.stringbool().default(false),

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
  extends: [
    node(),
    vercel(),

    // Packages
    authEnv,
    dbEnv,
    kvEnv,
    queueEnv,
  ],
})
