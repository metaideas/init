import { createMiddleware } from "hono/factory"

export const withSupabase = createMiddleware(async (c, next) => {
  const { createClient } = await import("@this/supabase/web")
  const supabase = await createClient()

  c.set("supabase", supabase)

  await next()
})

export const withDb = createMiddleware(async (c, next) => {
  const { createDatabase } = await import("@this/db/client")
  const db = await createDatabase()

  c.set("db", db)

  await next()
})
