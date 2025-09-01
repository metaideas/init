import { checkIsLocalDatabase } from "@init/db/helpers"
import { db } from "@init/env/presets"
import { defineConfig } from "drizzle-kit"

const env = db()

if (
  !(checkIsLocalDatabase(env.DATABASE_URL) || env.RUN_PRODUCTION_MIGRATIONS)
) {
  throw new Error(
    "DATABASE_URL is not allowed to be a remote URL when RUN_PRODUCTION_MIGRATIONS is not true"
  )
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
})
