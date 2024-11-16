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

  dbCredentials: { url: process.env.POSTGRES_URL as string },
  casing: "snake_case",
  breakpoints: true,
  strict: true,
  verbose: true,
})
