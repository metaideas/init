import { sql } from "@init/db/helpers"
import { withRateLimiting } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables.
 */
export default factory.createApp().get("/", withRateLimiting("1 minute", 60), async (c) => {
  await c.var.db.execute(sql`SELECT 1`)

  return c.text("ok")
})
