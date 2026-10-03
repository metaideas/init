import { greetUser } from "#features/demo/workflows.ts"
import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"
import { workflows } from "#shared/workflows.ts"

export default factory.createApp().post("/", requireSession, async (c) => {
  const run = await workflows.run(
    greetUser,
    { userId: c.var.session.user.id },
    { queue: "default" }
  )

  return c.json({ id: run.id }, 202)
})
