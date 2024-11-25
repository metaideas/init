import { defineConfig } from "drizzle-kit"

if (
  process.env.DATABASE_URL?.includes("https") &&
  process.env.RUN_PRODUCTION_MIGRATIONS !== "true"
) {
  throw new Error(
    "DATABASE_URL is not allowed to be a remote URL when RUN_PRODUCTION_MIGRATIONS is not true"
  )
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN as string,
  },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
})
