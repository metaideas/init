import { Hono } from "hono"
import { env } from "hono/adapter"

import { ensureEnv } from "@this/env"

import type { AppContext } from "~/shared/types"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables. Since we can only add secrets in the
 * Cloudflare Dashboard, it's a good way to ensure that the API is running
 * correctly.
 */
const health = new Hono<AppContext>().get("/", async c => {
  const [authEnv, dbEnv, emailEnv, kvEnv, queueEnv] = await Promise.all([
    import("@this/env/auth"),
    import("@this/env/db"),
    import("@this/env/email"),
    import("@this/env/kv"),
    import("@this/env/queue"),
  ])

  // Ensure environment variables are set
  ensureEnv([authEnv, dbEnv, emailEnv, kvEnv, queueEnv], {
    env: env(c) as Record<string, string>,
  })

  return c.text("ok")
})

export default health
