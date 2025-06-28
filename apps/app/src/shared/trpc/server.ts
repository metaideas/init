import "server-only"

import { database } from "@init/db/client"
import { redis } from "@init/kv/client"
import * as z from "@init/utils/schema"
import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { geolocation, ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { after } from "next/server"
import { cache } from "react"
import superjson from "superjson"
import { auth, validateRequest } from "~/shared/auth/server"
import { logger } from "~/shared/logger"

export const createContext = cache(
  async (options?: FetchCreateContextFnOptions) => ({
    ...(options ?? {}),
    auth,
    db: database(),
    kv: redis(),
    session: await validateRequest(),
    logger: logger.child({
      group: "trpc",
      requestId: crypto.randomUUID(),
    }),
  })
)

export const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const middleware = t.middleware
export const createRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const publicProcedure = t.procedure.use(
  async ({ ctx, next, meta, path }) => {
    const startTime = performance.now()

    const result = await next()

    const duration = performance.now() - startTime

    // Don't block the response while we log the TRPC result
    after(async () => {
      const headersList = await headers()
      const [ip, geo] = await Promise.all([
        ipAddress({ headers: headersList }),
        geolocation({ headers: headersList }),
      ])

      const formattedDuration = `${duration.toFixed(2)}ms`
      const context = { duration, ip, geo, meta }

      if (result.ok) {
        ctx.logger.info(
          context,
          `[TRPC] [${path}] Succeeded in ${formattedDuration}`
        )

        return
      }

      ctx.logger.error(
        { ...context, error: result.error },
        `[TRPC] [${path}] Failed in ${formattedDuration}`
      )
    })

    return result
  }
)

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    })
  }

  return next({ ctx: { ...ctx, ...ctx.session } })
})
