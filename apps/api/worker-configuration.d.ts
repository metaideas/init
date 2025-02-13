// Generated by Wrangler by running `wrangler types --env-interface CloudflareBindings`

interface CloudflareBindings {
  BETTER_AUTH_URL:
    | "http://localhost:3001"
    | "https://api.adelrodriguez.workers.dev"
  BETTER_AUTH_BASE_PATH: "/auth"
  DATABASE_URL: string
  DATABASE_AUTH_TOKEN: string
  EMAIL_FROM: string
  RESEND_API_KEY: string
  MOCK_RESEND: string
  AXIOM_DATASET: string
  AXIOM_TOKEN: string
  QSTASH_URL: string
  QSTASH_TOKEN: string
  QSTASH_CURRENT_SIGNING_KEY: string
  QSTASH_NEXT_SIGNING_KEY: string
  SENTRY_DSN: string
  SENTRY_ORG: string
  SENTRY_PROJECT: string
  SENTRY_AUTH_TOKEN: string
  NODE_ENV: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_TRUSTED_ORIGINS: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
}
