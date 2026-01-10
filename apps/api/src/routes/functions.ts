import { inngest } from "@init/jobs/client"
import { serve } from "@init/jobs/serve"
import env from "#shared/env.ts"
import { factory } from "#shared/utils.ts"

/**
 * The Inngest functions handler route
 *
 * This route serves Inngest functions for background job processing.
 * Functions should be defined separately and imported here.
 *
 * @example
 * ```ts
 * import { myFunction } from "./functions/my-function"
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
    signingKeyFallback: env.INNGEST_SIGNING_KEY,
  })
)
