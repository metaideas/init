import { getContext } from "hono/context-storage"

import { nameFunction } from "@this/queue"

import type { AppContext } from "~/lib/types"

const queue = getContext<AppContext>().var.queue

export const helloWorld = queue.createFunction(
  nameFunction("Hello World"),
  { event: "test/helloWorld" },
  async ({ step, logger }) => {
    logger.info({ message: "Hello from outside of the function!" })

    const random = await step.run("test", () => Math.random())

    logger.info({ random })
  }
)
