import { nameFunction, queue } from "@this/queue"
import { serve } from "@this/queue/nextjs"

const helloWorld = queue.createFunction(
  nameFunction("Hello World"),
  { event: "test/helloWorld" },
  ({ step, logger }) => {
    logger.info("Hello from NextJS route")
    step.run("test", () => console.log("Hello from NextJS route"))
  }
)

export const { POST, GET, PUT } = serve({
  client: queue,
  functions: [helloWorld],
})
