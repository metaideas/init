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

export const auth = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string(),
      BASE_URL: z.url(),
    },
    runtimeEnv: process.env,
  })

export const axiom = () => {
  createEnv({
    server: {
      AXIOM_TOKEN: z.string(),
      AXIOM_DATASET: z.string(),
    },
    runtimeEnv: process.env,
  })
}

export const axiomNextjs = () => {
  createEnv({
    client: {
      NEXT_PUBLIC_AXIOM_TOKEN: z.string(),
      NEXT_PUBLIC_AXIOM_DATASET: z.string(),
    },
    clientPrefix: "NEXT_PUBLIC_",
    runtimeEnvStrict: {
      NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
      NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    },
  })
}

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

export const sentry = () =>
  createEnv({
    server: {
      SENTRY_DSN: z.string(),
      SENTRY_AUTH_TOKEN: z.string(),
      SENTRY_ORG: z.string(),
      SENTRY_PROJECT: z.string(),
      SENTRY_DEBUG: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
  })

export const sentryExpo = () =>
  createEnv({
    client: {
      EXPO_PUBLIC_SENTRY_DSN: z.string(),
    },
    clientPrefix: "EXPO_PUBLIC_",
    runtimeEnvStrict: {
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    },
  })

export const sentryNextjs = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.string(),
    },
    clientPrefix: "NEXT_PUBLIC_",
    runtimeEnvStrict: {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  })
