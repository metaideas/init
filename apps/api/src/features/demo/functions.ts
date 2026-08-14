import { inngest } from "@init/workflows/client"
import events from "@init/workflows/schema"

export const demoFunction = inngest.createFunction(
  { id: "demo-function", triggers: [events.demoEmailSent] },
  async ({ event, step, logger }) => {
    logger.info(`Demo function called ${event.name}`)

    await step.run("demo-step", () => {
      logger.info(`Demo step called. This is only called once ${event.name}`)
      return { success: true }
    })

    return { success: true }
  }
)
