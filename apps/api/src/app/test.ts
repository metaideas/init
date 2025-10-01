import { Hono } from "hono"
import { requireSession } from "~/shared/middleware"
import type { AppContext } from "~/shared/types"

const test = new Hono<AppContext>()
  .get("/ping", (c) => c.text("pong"))
  .get("/me", requireSession, async (c) => {
    const user = await c.var.session.user

    return c.json(user)
  })

export default test
