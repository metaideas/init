import { UnauthenticatedError, UnauthorizedError } from "@init/error"
import { buildLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { createBuilder } from "fluent-convex"
import type { DataModel } from "#functions/_generated/dataModel.js"
import type { ActionCtx, MutationCtx, QueryCtx } from "#functions/_generated/server.js"
import { authComponent } from "#functions/shared/auth.ts"

export const convex = createBuilder<DataModel>()

export const withLogger = convex.createMiddleware((ctx, next) =>
  next({ ...ctx, logger: singleton("logger:convex", () => buildLogger([LoggerCategory.CONVEX])) })
)

export type GenericCtx = QueryCtx | ActionCtx | MutationCtx

export const withAuthentication = convex
  .$context<GenericCtx>()
  .createMiddleware(async (ctx, next) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new UnauthenticatedError()
    }

    const authUser = await authComponent.getAuthUser(ctx)

    if (!authUser) {
      throw new UnauthenticatedError()
    }

    return next({ ...ctx, authUser, identity })
  })

export const withAdmin = convex.$context<GenericCtx>().createMiddleware(async (ctx, next) => {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new UnauthenticatedError()
  }

  const authUser = await authComponent.getAuthUser(ctx)

  if (!authUser) {
    throw new UnauthenticatedError()
  }

  if (authUser.role !== "admin") {
    throw new UnauthorizedError({ userId: identity.subject })
  }

  return next({ ...ctx, authUser, identity })
})

export const publicQuery = convex.query().use(withLogger)
export const publicMutation = convex.mutation().use(withLogger)
export const publicAction = convex.action().use(withLogger)

export const protectedQuery = convex.query().use(withLogger).use(withAuthentication)
export const protectedMutation = convex.mutation().use(withLogger).use(withAuthentication)
export const protectedAction = convex.action().use(withLogger).use(withAuthentication)

export const privateQuery = convex.query().use(withLogger).use(withAdmin)
export const privateMutation = convex.mutation().use(withLogger).use(withAdmin)
export const privateAction = convex.action().use(withLogger).use(withAdmin)

export const internalQuery = convex.query().use(withLogger)
export const internalMutation = convex.mutation().use(withLogger)
export const internalAction = convex.action().use(withLogger)
