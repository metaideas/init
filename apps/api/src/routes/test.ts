import { Hono } from "hono"
// import { getContext } from "hono/context-storage"

// import type { TriggerBody } from "@this/queue/workflows"
// import { serve } from "@this/queue/workflows/hono"

import { requireSession } from "~/shared/middlewares"
import type { AppContext } from "~/shared/types"

const test = new Hono<AppContext>()
  .get("/ping", c => c.text("pong"))
  .get("/users", requireSession, async c => {
    const users = await c.var.db.query.users.findMany()

    return c.json(users)
  })
// .post(
//   "/workflow",
//   serve<TriggerBody<"test/workflow">>(async context => {
//     const { name } = context.requestPayload
//     const c = getContext<AppContext>()

//     const users = await context.run("step-1", async () =>
//       c.var.db.query.users.findMany()
//     )

//     await context.run("log-1", () => {
//       c.var.logger.info("Sleeping for 5 seconds")
//     })

//     await context.sleep("sleep-1", 5)

//     c.var.logger.info({ name })

//     c.var.logger.info("Users", { users })
//   })
// )

export default test
