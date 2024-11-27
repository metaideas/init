import { logger } from "@this/observability/logger"
import { client, createFunction, nameFunction } from "@this/queue"
import { serve } from "@this/queue/nextjs"

const helloWorld = createFunction(
  nameFunction("Hello World"),
  { event: "test/helloWorld" },
  ({ step }) => {
    logger.info("Hello from NextJS route")
    step.run("test", () => console.log("Hello from NextJS route"))
  }
)

export const { POST, GET, PUT } = serve({
  client,
  functions: [helloWorld],
})
