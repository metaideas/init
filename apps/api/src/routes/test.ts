import { requireSession } from "~/shared/middleware"
import { factory } from "~/shared/utils"

const test = factory
  .createApp()
  .get("/ping", (c) => c.text("pong"))
  .get("/me", requireSession, (c) => c.json(c.var.session.user))

export default test
