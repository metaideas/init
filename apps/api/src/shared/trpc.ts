import * as z from "@init/utils/schema"
import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { Context } from "hono"
import superjson from "superjson"
import type { Session } from "~/shared/auth"
import type { AppContext } from "~/shared/types"

const transformer = superjson

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
    decision: c.var.decision,
    info: opts.info,
    kv: c.var.kv,
    logger: c.var.logger.child({ group: "trpc" }),
    req: opts.req,
    resHeaders: opts.resHeaders,
    session,
    security: c.var.security,
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
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
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
