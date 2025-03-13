import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { Context } from "hono"

import type { Session } from "@this/auth/server"
import { ZodError } from "@this/utils/schema"
import { transformer } from "@this/utils/trpc-client"

import type { AppContext } from "~/shared/types"

type TRPCContext = FetchCreateContextFnOptions &
  AppContext["Variables"] & {
    session: Session | null
  }

export async function createTRPCContext(
  opts: FetchCreateContextFnOptions,
  c: Context<AppContext>
): Promise<TRPCContext> {
  const session = await c.var.auth.api.getSession({ headers: opts.req.headers })

  return {
    auth: c.var.auth,
    db: c.var.db,
    info: opts.info,
    kv: c.var.kv,
    logger: c.var.logger,
    req: opts.req,
    resHeaders: opts.resHeaders,
    session,
  }
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const middleware = t.middleware
export const createRouter = t.router

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({ ctx: { ...ctx.session } })
})
