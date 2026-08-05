import { checkIsLocalDatabase } from "@init/db/helpers"
import { defineConfig } from "drizzle-kit"
import { ENV } from "#env.generated.ts"

if (!(checkIsLocalDatabase(ENV.DATABASE_URL) || ENV.RUN_PRODUCTION_MIGRATIONS)) {
  throw new Error(
    "DATABASE_URL is not allowed to be a remote URL when RUN_PRODUCTION_MIGRATIONS is not true"
  )
}

export default defineConfig({
  breakpoints: true,
  casing: "snake_case",
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/schema.ts",
  strict: true,
  verbose: true,
})
