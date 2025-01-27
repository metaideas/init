import type { db } from "@this/db/client"
import { ensureEnv } from "@this/env/helpers"
import { createMiddleware } from "hono/factory"

/**
 * Load environment variables from the request context into process.env. Also
 * ensures that the environment variables are set correctly.
 */
export const loadEnv = createMiddleware(async (c, next) => {
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

  const { default: dbServer } = await import("@this/env/db.server")

  ensureEnv([dbServer], { env: c.env })

  await next()
})

/**
 * Load the database client into the request context
 */
export const withDb = createMiddleware<{
  Variables: { db: typeof db }
}>(async (c, next) => {
  const { db } = await import("@this/db/client")

  c.set("db", db)

  await next()
})
