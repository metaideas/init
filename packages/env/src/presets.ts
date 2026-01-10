import { EXPO_PUBLIC_ENV_PREFIX, REACT_PUBLIC_ENV_PREFIX } from "@init/utils/constants"
import { isCI } from "@init/utils/environment"
import * as z from "@init/utils/schema"
import { createEnv } from "@t3-oss/env-core"

export const node = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      NODE_ENV: z.env(),
    },
    skipValidation: isCI(),
  })

// Presets for system environment variables from popular services (Vercel, Neon,
// Supabase, Render, etc.)
// export * from "@t3-oss/env-core/presets-zod"

// Package presets.
//
// You can import these into your apps and extend them from your env config if
// you are using a package that needs environment variables.

export const arcjet = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      ARCJET_KEY: z.string(),
    },
    skipValidation: isCI(),
  })

export const auth = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      AUTH_SECRET: z.string(),
    },
    skipValidation: isCI(),
  })

auth.providers = {
  /**
   * Sign in with GitHub
   */
  github: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),
      },
      skipValidation: isCI(),
    }),
  /**
   * Sign in with Google
   */
  google: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
      },
      skipValidation: isCI(),
    }),
}

export const convex = {
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_CONVEX_SITE_URL: z.url(),
        EXPO_PUBLIC_CONVEX_URL: z.url(),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  react: () =>
    createEnv({
      client: {
        PUBLIC_CONVEX_SITE_URL: z.url(),
        PUBLIC_CONVEX_URL: z.url(),
      },
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
      runtimeEnv: import.meta.env,
      skipValidation: isCI(),
    }),
}

export const db = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      DATABASE_URL: z.url(),
      RUN_PRODUCTION_MIGRATIONS: z.stringbool().default(false),
    },
    skipValidation: isCI(),
  })

export const kv = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      REDIS_URL: z.url(),
    },
    skipValidation: isCI(),
  })

export const s3 = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      S3_ACCESS_KEY_ID: z.string(),
      S3_BUCKET: z.string().optional(),
      S3_ENDPOINT: z.string().optional(),
      S3_REGION: z.string().optional(),
      S3_SECRET_ACCESS_KEY: z.string(),
    },
    skipValidation: isCI(),
  })

export const resend = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      EMAIL_FROM: z.string(),
      MOCK_RESEND: z.stringbool().default(false),
      RESEND_API_KEY: z.string(),
    },
    skipValidation: isCI(),
  })

export const sentry = {
  client: () =>
    createEnv({
      client: {
        PUBLIC_SENTRY_DEBUG: z.stringbool().default(false),
        PUBLIC_SENTRY_DSN: z.string(),
      },
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
      runtimeEnv: import.meta.env,
      skipValidation: isCI(),
    }),
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_SENTRY_DSN: z.string(),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnv: process.env,
      server: {
        SENTRY_AUTH_TOKEN: z.string(),
        SENTRY_DEBUG: z.stringbool().default(false),
        SENTRY_ORG: z.string(),
        SENTRY_PROJECT: z.string(),
      },
      // RuntimeEnvStrict: {
      //   EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
      //   SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      //   SENTRY_ORG: process.env.SENTRY_ORG,
      //   SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      //   SENTRY_DEBUG: process.env.SENTRY_DEBUG,
      // },
    }),
  server: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        SENTRY_AUTH_TOKEN: z.string(),
        SENTRY_DEBUG: z.stringbool().default(false),
        SENTRY_DSN: z.string(),
        SENTRY_ORG: z.string(),
        SENTRY_PROJECT: z.string(),
        SENTRY_SPOTLIGHT: z.stringbool().default(false),
      },
      skipValidation: isCI(),
    }),
}

export const openai = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      OPENAI_API_KEY: z.string(),
    },
    skipValidation: isCI(),
  })

export const anthropic = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      ANTHROPIC_API_KEY: z.string(),
    },
    skipValidation: isCI(),
  })

export const stripe = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      STRIPE_SECRET_KEY: z.string(),
      STRIPE_WEBHOOK_SECRET: z.string(),
    },
    skipValidation: isCI(),
  })

export const posthog = {
  expo: () =>
    createEnv({
      client: {
        EXPO_PUBLIC_POSTHOG_API_KEY: z.string(),
        EXPO_PUBLIC_POSTHOG_HOST: z.url(),
      },
      clientPrefix: EXPO_PUBLIC_ENV_PREFIX,
      runtimeEnv: process.env,
      skipValidation: isCI(),
    }),
  react: () =>
    createEnv({
      client: {
        PUBLIC_POSTHOG_API_KEY: z.string(),
        PUBLIC_POSTHOG_HOST: z.url(),
      },
      clientPrefix: REACT_PUBLIC_ENV_PREFIX,
      runtimeEnv: import.meta.env,
      skipValidation: isCI(),
    }),
  server: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        POSTHOG_API_KEY: z.string(),
        POSTHOG_HOST: z.url(),
      },
      skipValidation: isCI(),
    }),
}

export const inngest = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      INNGEST_EVENT_KEY: z.string().optional(),
      INNGEST_SIGNING_KEY: z.string().optional(),
    },
    skipValidation: isCI(),
  })

export const upstash = {
  redis: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        UPSTASH_REDIS_REST_TOKEN: z.string(),
        UPSTASH_REDIS_REST_URL: z.url(),
      },
      skipValidation: isCI(),
    }),
  vector: () =>
    createEnv({
      runtimeEnv: process.env,
      server: {
        UPSTASH_VECTOR_REST_TOKEN: z.string(),
        UPSTASH_VECTOR_REST_URL: z.string().url(),
      },
      skipValidation: isCI(),
    }),
}

export const tauri = () =>
  createEnv({
    client: {
      TAURI_ENV_ARCH: z.string().optional(),
      TAURI_ENV_DEBUG: z.stringbool().default(false),
      TAURI_ENV_FAMILY: z.string().optional(),
      TAURI_ENV_PLATFORM: z.string().optional(),
      TAURI_ENV_PLATFORM_VERSION: z.string().optional(),
      TAURI_ENV_TARGET_TRIPLE: z.string().optional(),
    },
    clientPrefix: "TAURI_ENV_",
    runtimeEnv: import.meta.env,
    skipValidation: isCI(),
  })
