import { SeedPostgres } from "@snaplet/seed/adapter-postgres"
import { defineConfig } from "@snaplet/seed/config"
import env from "@this/env/supabase/server"
import postgres from "postgres"

export default defineConfig({
  adapter: () => {
    const client = postgres(env.POSTGRES_URL)
    return new SeedPostgres(client)
  },

  select: ["!*", "auth.*", "public.*"],
})
