import type { db } from "@this/db/client"
import { createMiddleware } from "hono/factory"

export default createMiddleware<{
  Variables: { db: typeof db }
}>(async (c, next) => {
  const { db } = await import("@this/db/client")

  c.set("db", db)

  await next()
})
