import { Hono } from "hono"

import { sql } from "@init/db/helpers"
import { ensureEnv } from "@init/env"

import type { AppContext } from "~/shared/types"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables.
 */
export default new Hono<AppContext>()
  .get("/", async c => {
    await c.var.db.execute(sql`SELECT 1`)

    return c.text("ok")
  })
  .get("/env", async c => {
    const [auth, db, observability] = await Promise.all([
      import("@init/env/auth"),
      import("@init/env/db"),
      import("@init/env/observability/server"),
    ])

    // Ensure environment variables are set
    ensureEnv([auth, db, observability])

    return c.text("ok")
  })
