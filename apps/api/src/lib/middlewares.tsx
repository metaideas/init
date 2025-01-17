import type { db } from "@this/db/client"
import { createMiddleware } from "hono/factory"

export const withDb = createMiddleware<{
  Variables: { db: typeof db }
}>(async (c, next) => {
  const { db } = await import("@this/db/client")

  c.set("db", db)

  await next()
})

export const withEnv = createMiddleware(async (c, next) => {
  for (const [key, value] of Object.entries(c.env)) {
    process.env[key] = value as string
  }

  await next()
})
