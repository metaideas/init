import { inngest } from "@init/workflows/client"
import { serve } from "@init/workflows/serve"
import env from "#shared/env.ts"
import { factory } from "#shared/utils.ts"

/**
 * The Inngest workflows handler route
 *
 * This route serves Inngest workflows for background tasks.
 * Workflows should be defined separately and imported here.
 *
 * @example
 * ```ts
 * import { myWorkflow } from "./workflows/my-workflow"
 *
 */
export default factory.createApp().on(
  ["GET", "PUT", "POST"],
  "/",
  serve({
    client: inngest,
    functions: [
      inngest.createFunction(
        { id: "demo-function" },
        { event: "demo/email.sent" },
        async ({ event, step, logger }) => {
          logger.info`Demo function called ${event.name}`

          await step.run("demo-step", () => {
            logger.info`Demo step called. This is only called once ${event.name}`
            return { success: true }
          })

          return { success: true }
        }
      ),
    ],
    signingKey: env.INNGEST_SIGNING_KEY,
    signingKeyFallback: env.INNGEST_SIGNING_KEY_FALLBACK,
  })
)
