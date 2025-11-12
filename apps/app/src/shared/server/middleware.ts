import crypto from "node:crypto"
import { database } from "@init/db/client"
import { logger } from "@init/observability/logger"
import { Fault } from "@init/utils/fault"
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "~/shared/auth/server"

export const withRequestId = createMiddleware().server(({ next }) =>
  next({ context: { requestId: crypto.randomUUID() } })
)

export const withLogger = createMiddleware()
  .middleware([withRequestId])
  .server(({ next, context }) =>
    next({
      context: {
        logger: logger.child({
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
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    })

    if (!session) {
      throw new Fault("AUTHENTICATION_ERROR", {
        public: "You are not authenticated. Please sign in to continue.",
        internal: "User is not authenticated",
        context: {
          requestId: context.requestId,
        },
      })
    }

    return next({ context: { session } })
  })

export const requireAdmin = createMiddleware()
  .middleware([requireSession])
  .server(({ next, context }) => {
    const { user } = context.session

    if (user.role !== "admin") {
      throw new Fault("AUTHORIZATION_ERROR", {
        public:
          "You are not authorized to access this resource. Please contact support if you believe this is an error.",
        internal: "User is not an admin",
        context: {
          session: context.session,
          requestId: context.requestId,
        },
      })
    }

    return next()
  })
