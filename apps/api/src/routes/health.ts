import { sql } from "@init/db/helpers"
import { withRateLimiting } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

export default factory.createApp().get("/", withRateLimiting("1 minute", 60), async (context) => {
  await context.var.db.execute(sql`SELECT 1`)

  return context.text("ok")
})
