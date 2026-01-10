import { getLogger } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { dependencyInjectionMiddleware, Inngest } from "inngest"
import { extendedTracesMiddleware } from "inngest/experimental"
import schemas from "#schema.ts"

/**
 * Events type - inferred from the event schemas
 */
export type Events = typeof schemas

export const inngest = singleton(
  "inngest",
  () =>
    new Inngest({
      id: "init",
      logger: getLogger(["inngest"]),
      middleware: [
        dependencyInjectionMiddleware({
          // Add any dependencies here
        }),
        extendedTracesMiddleware({ behaviour: "auto" }),
      ],
      schemas,
    })
)
