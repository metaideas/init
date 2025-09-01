import { sql } from "@init/db/helpers"
import { slidingWindow } from "@init/security/ratelimit"
import { Hono } from "hono"
import { rateLimitByIp } from "~/shared/middlewares"
import type { AppContext } from "~/shared/types"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables.
 */
export default new Hono<AppContext>().get(
  "/",
  rateLimitByIp("health", slidingWindow(60, "1 m")),
  async (c) => {
    await c.var.db.execute(sql`SELECT 1`)

    return c.text("ok")
  }
)
