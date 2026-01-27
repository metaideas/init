import crypto from "node:crypto"
import { Fault } from "@init/error/fault"
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
  .server(async ({ next, context }) => {
    const { data: session } = await authClient.getSession()

    if (!session) {
      throw Fault.create("auth.unauthenticated")
        .withDescription(
          "User is not authenticated.",
          "You are not authenticated. Please sign in to continue."
        )
        .withContext({
          requestId: context.requestId,
        })
    }

    return next({ context: { session } })
  })

export const requireAdmin = createMiddleware()
  .middleware([requireSession])
  .server(({ next, context }) => {
    const { user } = context.session

    if (user.role !== "admin") {
      throw Fault.create("auth.unauthorized")
        .withDescription(
          "User is not an admin.",
          "You are not an admin. Please contact support if you believe this is an error."
        )
        .withContext({
          requestId: context.requestId,
          userId: context.session.user.id,
        })
    }

    return next()
  })
