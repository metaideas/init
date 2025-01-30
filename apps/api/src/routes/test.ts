import { Hono } from "hono"
import { requireSession } from "~/lib/middlewares"

import type { AppContext } from "~/lib/types"

const test = new Hono<AppContext>()
  .get("/ping", c => c.text("pong"))
  .get("/users", requireSession, async c => {
    const users = await c.var.db.query.users.findMany()

    return c.json(users)
  })
  .post("/email", async c => {
    const { sendEmail } = await import("@this/email")
    const { default: TestEmail } = await import("@this/email/test-email")

    await sendEmail({
      emails: ["delivered@resend.dev"],
      subject: "Test",
      body: TestEmail(),
    })

    return c.json({ message: "Email sent" })
  })

export default test
