import {
  EXPO_PUBLIC_ENV_PREFIX,
  REACT_PUBLIC_ENV_PREFIX,
} from "@init/utils/constants"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"
import { createEnv } from "@t3-oss/env-core"

export const node = () =>
  createEnv({
    server: {
      NODE_ENV: z.env(),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

// Presets for system environment variables from popular services (Vercel, Neon,
// Supabase, Render, etc.)
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
    skipValidation: isCI(),
  })

export const auth = () =>
  createEnv({
    server: {
      AUTH_SECRET: z.string(),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const axiom = {
  react: () =>
    createEnv({
      client: {
        PUBLIC_AXIOM_TOKEN: z.string(),
        PUBLIC_AXIOM_DATASET: z.string(),
      },
      runtimeEnv: import.meta.env,
      skipValidation: isCI(),
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
    }),
  server: () =>
    createEnv({
      server: {
        AXIOM_TOKEN: z.string(),
        AXIOM_DATASET: z.string(),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_AXIOM_TOKEN: z.string(),
        EXPO_PUBLIC_AXIOM_DATASET: z.string(),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnvStrict: {
        EXPO_PUBLIC_AXIOM_TOKEN: process.env.EXPO_PUBLIC_AXIOM_TOKEN,
        EXPO_PUBLIC_AXIOM_DATASET: process.env.EXPO_PUBLIC_AXIOM_DATASET,
      },
      skipValidation: isCI(),
    }),
}

export const db = () =>
  createEnv({
    server: {
      DATABASE_URL: z.url(),
      RUN_PRODUCTION_MIGRATIONS: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const resend = () =>
  createEnv({
    server: {
      EMAIL_FROM: z.string(),
      RESEND_API_KEY: z.string(),
      MOCK_RESEND: z.stringbool().default(false),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const sentry = {
  server: () =>
    createEnv({
      server: {
        SENTRY_DSN: z.string(),
        SENTRY_AUTH_TOKEN: z.string(),
        SENTRY_ORG: z.string(),
        SENTRY_PROJECT: z.string(),
        SENTRY_DEBUG: z.stringbool().default(false),
        SENTRY_SPOTLIGHT: z.stringbool().default(false),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_SENTRY_DSN: z.string(),
      },
      server: {
        SENTRY_AUTH_TOKEN: z.string(),
        SENTRY_ORG: z.string(),
        SENTRY_PROJECT: z.string(),
        SENTRY_DEBUG: z.stringbool().default(false),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnvStrict: {
        EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
        SENTRY_ORG: process.env.SENTRY_ORG,
        SENTRY_PROJECT: process.env.SENTRY_PROJECT,
        SENTRY_DEBUG: process.env.SENTRY_DEBUG,
      },
    }),
  react: () =>
    createEnv({
      client: {
        PUBLIC_SENTRY_DSN: z.string(),
        PUBLIC_SENTRY_DEBUG: z.stringbool().default(false),
      },
      runtimeEnv: import.meta.env,
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
      skipValidation: isCI(),
    }),
}

export const openai = () =>
  createEnv({
    server: {
      OPENAI_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const anthropic = () =>
  createEnv({
    server: {
      ANTHROPIC_API_KEY: z.string(),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const stripe = () =>
  createEnv({
    server: {
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
    },
    runtimeEnv: process.env,
    skipValidation: isCI(),
  })

export const posthog = {
  server: () =>
    createEnv({
      server: {
        POSTHOG_HOST: z.url(),
        POSTHOG_API_KEY: z.string(),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_POSTHOG_HOST: z.url(),
        EXPO_PUBLIC_POSTHOG_API_KEY: z.string(),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  react: () =>
    createEnv({
      client: {
        PUBLIC_POSTHOG_HOST: z.url(),
        PUBLIC_POSTHOG_API_KEY: z.string(),
      },
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
      runtimeEnv: import.meta.env,
      skipValidation: isCI(),
    }),
}

export const upstash = {
  redis: () =>
    createEnv({
      server: {
        UPSTASH_REDIS_REST_TOKEN: z.string(),
        UPSTASH_REDIS_REST_URL: z.url(),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  qstash: () =>
    createEnv({
      server: {
        QSTASH_URL: z.url().optional(),
        QSTASH_TOKEN: z.string(),
        QSTASH_CURRENT_SIGNING_KEY: z.string(),
        QSTASH_NEXT_SIGNING_KEY: z.string(),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  vector: () =>
    createEnv({
      server: {
        UPSTASH_VECTOR_REST_TOKEN: z.string(),
        UPSTASH_VECTOR_REST_URL: z.string().url(),
      },
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
}

export const tauri = () =>
  createEnv({
    client: {
      TAURI_ENV_DEBUG: z.stringbool().default(false),
      TAURI_ENV_TARGET_TRIPLE: z.string().optional(),
      TAURI_ENV_ARCH: z.string().optional(),
      TAURI_ENV_PLATFORM: z.string().optional(),
      TAURI_ENV_PLATFORM_VERSION: z.string().optional(),
      TAURI_ENV_FAMILY: z.string().optional(),
    },
    runtimeEnv: import.meta.env,
    clientPrefix: "TAURI_ENV_",
    skipValidation: isCI(),
  })
