import { TRPCError, initTRPC } from "@trpc/server"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

import { transformer } from "@this/utils/trpc"

import type { AppContext } from "~/lib/types"

export type TRPCContext = FetchCreateContextFnOptions & AppContext["Variables"]

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
