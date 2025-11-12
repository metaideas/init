import { sql } from "@init/db/helpers"
import { Hono } from "hono"
import { withRateLimiting } from "~/shared/middleware"
import type { AppContext } from "~/shared/types"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables.
 */
export default new Hono<AppContext>().get(
  "/",
  withRateLimiting("1m", 60),
  async (c) => {
    await c.var.db.execute(sql`SELECT 1`)

    return c.text("ok")
  }
)
