import { client, nameFunction } from "@this/queue"
import { serve } from "@this/queue/nextjs"

const helloWorld = client.createFunction(
  nameFunction("Hello World"),
  { event: "test/helloWorld" },
  ({ step, logger }) => {
    logger.info("Hello from NextJS route")
    step.run("test", () => console.log("Hello from NextJS route"))
  }
)

export const { POST, GET, PUT } = serve({
  client,
  functions: [helloWorld],
})
