import crypto from "node:crypto"
import { createMiddleware } from "@tanstack/react-start"
import { logger } from "#shared/logger.ts"

export const withRequestId = createMiddleware().server(({ next }) =>
  next({ context: { requestId: crypto.randomUUID() } })
)

export const withLogger = createMiddleware()
  .middleware([withRequestId])
  .server(({ next, context }) =>
    next({
      context: {
        logger: logger.getChild("server-function").with({
          requestId: context.requestId,
        }),
      },
    })
  )
