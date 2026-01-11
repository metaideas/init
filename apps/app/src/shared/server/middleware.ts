import crypto from "node:crypto"
import { database } from "@init/db/client"
import { Fault } from "@init/error/fault"
import { logger } from "@init/observability/logger"
import { createMiddleware } from "@tanstack/react-start"
import { authClient } from "#shared/auth.ts"

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

export const withDatabase = createMiddleware().server(({ next }) =>
  next({ context: { db: database() } })
)

export const requireSession = createMiddleware()
  .middleware([withRequestId])
  .server(async ({ next, context }) => {
    const { data: session } = await authClient.getSession()

    if (!session) {
      throw Fault.create("AUTH.UNAUTHENTICATED")
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
      throw Fault.create("AUTH.UNAUTHORIZED")
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
