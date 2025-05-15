import { Hono } from "hono"
import { env } from "hono/adapter"

import { ensureEnv } from "@init/env"

import type { AppContext } from "~/shared/types"

// TODO(adelrodriguez): Change this to check that we have a connection to the
// database
/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables.
 */
export default new Hono<AppContext>().get("/", async c => {
  const [authEnv, dbEnv, emailEnv, kvEnv, queueEnv] = await Promise.all([
    import("@init/env/auth"),
    import("@init/env/db"),
    import("@init/env/email"),
    import("@init/env/kv"),
    import("@init/env/queue"),
  ])

  // Ensure environment variables are set
  ensureEnv([authEnv, dbEnv, emailEnv, kvEnv, queueEnv], {
    env: env(c) as Record<string, string>,
  })

  return c.text("ok")
})
