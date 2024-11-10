import env from "@this/env/supabase/server"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  entities: {
    roles: {
      provider: "supabase",
    },
  },
  schemaFilter: ["public"],
  dbCredentials: { url: env.POSTGRES_URL },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
})
