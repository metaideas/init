import * as z from "@init/utils/schema"
import { createEnv } from "@t3-oss/env-core"
import { createEnv as createEnvNextjs } from "@t3-oss/env-nextjs"

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

export const arcjet = () =>
  createEnv({
    server: {
      ARCJET_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })

export const auth = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string(),
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
  createEnvNextjs({
    client: {
      NEXT_PUBLIC_AXIOM_TOKEN: z.string(),
      NEXT_PUBLIC_AXIOM_DATASET: z.string(),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
      NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    },
  })
}

export const axiomExpo = () =>
  createEnv({
    client: {
      EXPO_PUBLIC_AXIOM_TOKEN: z.string(),
      EXPO_PUBLIC_AXIOM_DATASET: z.string(),
    },
    clientPrefix: "EXPO_PUBLIC_",
    runtimeEnvStrict: {
      EXPO_PUBLIC_AXIOM_TOKEN: process.env.EXPO_PUBLIC_AXIOM_TOKEN,
      EXPO_PUBLIC_AXIOM_DATASET: process.env.EXPO_PUBLIC_AXIOM_DATASET,
    },
  })

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
      EXPO_PUBLIC_SENTRY_URL: z.string(),
      EXPO_PUBLIC_SENTRY_ORG: z.string(),
      EXPO_PUBLIC_SENTRY_PROJECT: z.string(),
    },
    clientPrefix: "EXPO_PUBLIC_",
    runtimeEnvStrict: {
      EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      EXPO_PUBLIC_SENTRY_URL: process.env.EXPO_PUBLIC_SENTRY_URL,
      EXPO_PUBLIC_SENTRY_ORG: process.env.EXPO_PUBLIC_SENTRY_ORG,
      EXPO_PUBLIC_SENTRY_PROJECT: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
    },
  })

export const sentryNextjs = () =>
  createEnvNextjs({
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.string(),
    },
    server: {
      SENTRY_AUTH_TOKEN: z.string(),
      SENTRY_ORG: z.string(),
      SENTRY_PROJECT: z.string(),
      SENTRY_DEBUG: z.stringbool().default(false),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
  })

export const openai = () =>
  createEnv({
    server: {
      OPENAI_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })

export const anthropic = () =>
  createEnv({
    server: {
      ANTHROPIC_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })

export const upstashVector = () =>
  createEnv({
    server: {
      UPSTASH_VECTOR_REST_TOKEN: z.string(),
      UPSTASH_VECTOR_REST_URL: z.string().url(),
    },
    runtimeEnv: process.env,
  })

export const qstash = () =>
  createEnv({
    server: {
      QSTASH_URL: z.url().optional(),
      QSTASH_TOKEN: z.string(),
      QSTASH_CURRENT_SIGNING_KEY: z.string(),
      QSTASH_NEXT_SIGNING_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })

export const stripe = () =>
  createEnv({
    server: {
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
    },
    runtimeEnv: process.env,
  })

export const posthog = () =>
  createEnv({
    server: {
      POSTHOG_HOST: z.url(),
      POSTHOG_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
  })

export const posthogNextjs = () =>
  createEnvNextjs({
    client: {
      NEXT_PUBLIC_POSTHOG_HOST: z.url(),
      NEXT_PUBLIC_POSTHOG_API_KEY: z.string(),
    },
    experimental__runtimeEnv: {
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
    },
  })

export const posthogExpo = () =>
  createEnv({
    client: {
      EXPO_PUBLIC_POSTHOG_HOST: z.url(),
      EXPO_PUBLIC_POSTHOG_API_KEY: z.string(),
    },
    clientPrefix: "EXPO_PUBLIC_",
    runtimeEnvStrict: {
      EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      EXPO_PUBLIC_POSTHOG_API_KEY: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    },
  })

export const posthogClient = () =>
  createEnv({
    client: {
      VITE_POSTHOG_HOST: z.url(),
      VITE_POSTHOG_API_KEY: z.string(),
    },
    clientPrefix: "VITE_",
    runtimeEnvStrict: {
      VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST,
      VITE_POSTHOG_API_KEY: process.env.VITE_POSTHOG_API_KEY,
    },
  })
