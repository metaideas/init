import crypto from "node:crypto"
import { UnauthenticatedError, UnauthorizedError } from "@init/error"
import { createMiddleware } from "@tanstack/react-start"
import { authClient } from "#shared/auth.ts"
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

export const requireSession = createMiddleware()
  .middleware([withRequestId])
  .server(async ({ next }) => {
    const { data: session } = await authClient.getSession()

    if (!session) {
      throw new UnauthenticatedError()
    }

    return next({ context: { session } })
  })

export const requireAdmin = createMiddleware()
  .middleware([requireSession])
  .server(({ next, context }) => {
    const { user } = context.session

    if (user.role !== "admin") {
      throw new UnauthorizedError({ userId: context.session.user.id })
    }

    return next()
  })
