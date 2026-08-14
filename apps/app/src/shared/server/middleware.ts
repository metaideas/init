import crypto from "node:crypto"
import { database } from "@init/db/client"
import { createCsrfMiddleware, createMiddleware } from "@tanstack/react-start"
import { logger } from "#shared/logger.ts"

export const withCsrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
})

export const withRequestId = createMiddleware().server(({ next }) =>
  next({ context: { requestId: crypto.randomUUID() } })
)

export const withLogger = createMiddleware()
  .middleware([withRequestId])
  .server(({ next }) => next({ context: { logger } }))

export const withDatabase = createMiddleware().server(({ next }) =>
  next({ context: { database: database() } })
)
