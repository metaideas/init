import { createEnv } from "@init/env/nextjs"
import { auth, db, node, sentry, sentryNextjs, vercel } from "@init/env/presets"
import * as z from "@init/utils/schema"
import { addProtocol } from "@init/utils/url"

export default createEnv({
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .pipe(z.preprocess((url) => addProtocol(url), z.url())),

    NEXT_PUBLIC_API_URL: z.url().optional(),
  },
  extends: [
    node(),
    vercel(),

    // Packages
    auth(),
    db(),
    sentry(),
    sentryNextjs(),
  ],
})
