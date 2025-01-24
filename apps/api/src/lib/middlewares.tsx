import * as process from "node:process"
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
  // Copy environment variables from c.env to process.env, since `@this/env`
  // expects process.env to be set
  for (const [key, value] of Object.entries(c.env)) {
    // If value is not a string, it's not an environment variable
    if (typeof value !== "string") {
      continue
    }

    // Only set the environment variable if it's not already set
    process.env[key] ??= value
  }

  await next()
})
