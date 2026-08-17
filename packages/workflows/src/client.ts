import { log } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { dependencyInjectionMiddleware, Inngest } from "inngest"
import { extendedTracesMiddleware } from "inngest/experimental"

export type { Events } from "#schema.ts"

// Inngest loggers receive freeform arguments; fold them into one structured event.
function toEvent(args: unknown[]): Record<string, unknown> {
  const [first, ...rest] = args

  if (typeof first === "string") {
    return rest.length > 0 ? { details: rest, message: first } : { message: first }
  }

  return { details: args }
}

const workflowLogger = {
  debug: (...args: unknown[]) => {
    log.debug({ scope: "workflows", ...toEvent(args) })
  },
  error: (...args: unknown[]) => {
    log.error({ scope: "workflows", ...toEvent(args) })
  },
  info: (...args: unknown[]) => {
    log.info({ scope: "workflows", ...toEvent(args) })
  },
  warn: (...args: unknown[]) => {
    log.warn({ scope: "workflows", ...toEvent(args) })
  },
}

export const inngest = singleton(
  "inngest",
  () =>
    new Inngest({
      id: "init",
      logger: workflowLogger,
      middleware: [
        dependencyInjectionMiddleware({
          // Add any dependencies here
        }),
        extendedTracesMiddleware({ behaviour: "auto" }),
      ],
    })
)
