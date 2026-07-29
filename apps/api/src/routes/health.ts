import type { Context } from "hono"
import { sql } from "@init/db/helpers"
import type { AppContext } from "#shared/types.ts"
import { withRateLimiting } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

type DatabaseCheck = (context: Context<AppContext>) => Promise<void>

export function createHealthRoutes(
  checkDatabase: DatabaseCheck = async (context) => {
    await context.var.db.execute(sql`SELECT 1`)
  }
) {
  return factory.createApp().get("/", withRateLimiting("1 minute", 60), async (context) => {
    await checkDatabase(context)
    return context.text("ok")
  })
}

export default createHealthRoutes()
