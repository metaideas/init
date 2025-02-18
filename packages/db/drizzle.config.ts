import { defineConfig } from "drizzle-kit"

import env from "@this/env/db"

if (env.DATABASE_URL?.includes("https") && !env.RUN_PRODUCTION_MIGRATIONS) {
  throw new Error(
    "DATABASE_URL is not allowed to be a remote URL when RUN_PRODUCTION_MIGRATIONS is not true"
  )
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
})
