import * as z from "@init/utils/schema"
import { createEnv } from "@t3-oss/env-core"

export const node = () =>
  createEnv({
    server: {
      NODE_ENV: z.env(),
    },
    runtimeEnv: process.env,
  })

// Presets for system environment variables from popular services (Vercel,
// Neon, Supabase, Render, etc.)
export * from "@t3-oss/env-core/presets-zod"

// Package presets.
//
// You can import these into your apps and extend them from your env config if
// you are using a package that needs environment variables.

export const db = () =>
  createEnv({
    server: {
      DATABASE_URL: z.url(),
      DATABASE_AUTH_TOKEN: z.string(),
      RUN_PRODUCTION_MIGRATIONS: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
  })

export const email = () =>
  createEnv({
    server: {
      EMAIL_FROM: z.string(),
      RESEND_API_KEY: z.string(),
      MOCK_RESEND: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
  })
