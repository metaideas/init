import crypto from "node:crypto"
import { database } from "@init/db/client"
import { createRequestLogger } from "@init/observability/logger"
import { createCsrfMiddleware, createMiddleware } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import "#shared/logger.ts"

export const withCsrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
})

/**
 * Opens one wide event per server function call and emits it when the function settles. Handlers
 * add context through `context.log`.
 */
export const withLogger = createMiddleware({ type: "function" }).server(
  async ({ next, method, serverFnMeta }) => {
    const request = getRequest()
    const log = createRequestLogger({
      method,
      path: new URL(request.url).pathname,
      requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    })

    log.set({ serverFn: { filename: serverFnMeta.filename, name: serverFnMeta.name } })

    try {
      return await next({ context: { log } })
    } catch (error) {
      log.error(error instanceof Error ? error : String(error))
      throw error
    } finally {
      log.emit()
    }
  }
)

export const withDatabase = createMiddleware().server(({ next }) =>
  next({ context: { database: database() } })
)
