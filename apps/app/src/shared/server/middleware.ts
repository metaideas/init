import crypto from "node:crypto"
import { database } from "@init/db/client"
import { createRequestLogger } from "@init/observability/logger"
import { createCsrfMiddleware, createMiddleware } from "@tanstack/react-start"
import { logger } from "#shared/logger.ts"

export const withCsrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
})

/**
 * Opens one wide event per server request (SSR and server function calls)
 * and emits it with the response status. Handlers and server functions can
 * add context through `context.log`.
 */
export const withWideEvent = createMiddleware({ type: "request" }).server(
  async ({ request, pathname, next, handlerType, serverFnMeta }) => {
    const log = createRequestLogger({ method: request.method, path: pathname })

    log.set({
      handlerType,
      ...(serverFnMeta ? { serverFn: { filename: serverFnMeta.filename, name: serverFnMeta.name } } : {}),
    })

    try {
      const result = await next({ context: { log } })
      log.set({ status: result.response.status })
      log.emit()
      return result
    } catch (error) {
      log.error(error instanceof Error ? error : String(error))
      log.emit()
      throw error
    }
  }
)

export const withRequestId = createMiddleware().server(({ next }) =>
  next({ context: { requestId: crypto.randomUUID() } })
)

export const withLogger = createMiddleware()
  .middleware([withRequestId])
  .server(({ next }) => next({ context: { logger } }))

export const withDatabase = createMiddleware().server(({ next }) =>
  next({ context: { database: database() } })
)
