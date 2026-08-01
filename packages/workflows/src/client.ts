import { getLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { dependencyInjectionMiddleware, Inngest } from "inngest"
import { extendedTracesMiddleware } from "inngest/experimental"

export type { Events } from "#schema.ts"

export const inngest = singleton(
  "inngest",
  () =>
    new Inngest({
      id: "init",
      logger: getLogger(LoggerCategory.INNGEST),
      middleware: [
        dependencyInjectionMiddleware({
          // Add any dependencies here
        }),
        extendedTracesMiddleware({ behaviour: "auto" }),
      ],
    })
)
