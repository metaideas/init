import { transformer } from "@this/common/utils/trpc"
import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { Context } from "hono"
import type { AppContext } from "~/lib/types"

export type TRPCContext = AppContext["Variables"] & {
  req: Request
  resHeaders: Headers
}

export function createContext(
  opts: FetchCreateContextFnOptions,
  c: Context<AppContext>
) {
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    auth: c.var.auth,
    db: c.var.db,
    queue: c.var.queue,
  }
}

export const t = initTRPC.context<TRPCContext>().create({
  transformer,
})

export const middleware = t.middleware
export const router = t.router

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await ctx.auth.api.getSession({ headers: ctx.req.headers })

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return next({ ctx: { session } })
})

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(authMiddleware)
