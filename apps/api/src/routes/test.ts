import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

const test = factory
  .createApp()
  .get("/ping", (c) => c.text("pong"))
  .get("/me", requireSession, (c) => c.json(c.var.session.user))

export default test
