import { Hono } from "hono"

import { serve } from "@this/queue/hono"

import type { AppContext } from "~/lib/types"

export default new Hono<AppContext>().on(
  ["GET", "PUT", "POST"],
  "/",
  async c => {
    const { helloWorld } = await import("~/routes/queues/functions")

    const handler = serve({
      client: c.var.queue,
      functions: [helloWorld],
    })

    return handler(c)
  }
)
