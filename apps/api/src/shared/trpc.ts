import * as z from "@init/utils/schema"
import { initTRPC, TRPCError } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { Context } from "hono"
import superjson from "superjson"
import type { AppContext } from "#shared/types.ts"

const transformer = superjson

export function createTRPCContext(
  opts: FetchCreateContextFnOptions,
  c: Context<AppContext>
) {
  return {
    auth: c.var.auth,
    db: c.var.db,
    info: opts.info,
    kv: c.var.kv,
    logger: c.var.logger.child({ group: "trpc" }),
    req: opts.req,
    resHeaders: opts.resHeaders,
    security: c.var.security,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

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
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await ctx.auth.api.getSession({ headers: ctx.req.headers })

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({ ctx: { ...ctx, session } })
})
