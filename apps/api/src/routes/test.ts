import { requireSession } from "#shared/middleware.ts"
import { factory, HTTPFault } from "#shared/utils.ts"

export default factory
  .createApp()
  .get("/ping", (c) => c.text("pong"))
  .get("/me", requireSession, (c) => c.json(c.var.session.user))
  .get("/throw", () => {
    throw HTTPFault.create(400)
      .withTag("TEST_ERROR")
      .withDescription(
        "This is a test error! This message is for debugging purposes only.",
        "You've encountered an error. Please try again later."
      )
      .withContext({ timestamp: Date.now() })
  })
