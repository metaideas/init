import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

export default factory
  .createApp()
  .get("/ping", (c) => c.text("pong"))
  .get("/me", requireSession, (c) => c.json(c.var.session.user))
  .get("/throw", () => {
    throw new Error("Test error")
  })
