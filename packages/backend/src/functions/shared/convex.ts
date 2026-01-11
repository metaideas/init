import { Fault } from "@init/error/fault"
import { getLogger, LoggerCategory } from "@init/observability/logger"
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions"
import { typedV } from "convex-helpers/validators"
import {
  type ActionCtx,
  action,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "#functions/_generated/server.js"
import schema from "#functions/schema.ts"
import { convexAuth } from "#functions/shared/auth/index.ts"

export const vv = typedV(schema)

const baseContext = {
  logger: getLogger(LoggerCategory.CONVEX),
}

async function validateIdentity(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw Fault.create("auth.unauthenticated").withDescription("User is not authenticated")
  }

  return identity
}

async function validateAdmin(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw Fault.create("auth.unauthenticated").withDescription("User is not authenticated")
  }

  if (identity.role !== "admin") {
    throw Fault.create("auth.unauthorized").withDescription("User is not authorized").withContext({
      userId: identity.tokenIdentifier,
    })
  }

  return identity
}

export const publicQuery = customQuery(
  query,
  customCtx(() => baseContext)
)
export const publicMutation = customMutation(
  mutation,
  customCtx(() => baseContext)
)
export const publicAction = customAction(
  action,
  customCtx(() => baseContext)
)

export const protectedQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: {
      ...ctx.auth,
      ...convexAuth(ctx),
    },
    identity: await validateIdentity(ctx),
  }))
)
export const protectedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: { ...ctx.auth, ...convexAuth(ctx) },
    identity: await validateIdentity(ctx),
  }))
)
export const protectedAction = customAction(
  action,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: { ...ctx.auth, ...convexAuth(ctx) },
    identity: await validateIdentity(ctx),
  }))
)

export const privateQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: { ...ctx.auth, ...convexAuth(ctx) },
    identity: await validateAdmin(ctx),
  }))
)
export const privateMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: { ...ctx.auth, ...convexAuth(ctx) },
    identity: await validateAdmin(ctx),
  }))
)
export const privateAction = customAction(
  action,
  customCtx(async (ctx) => ({
    ...baseContext,
    auth: { ...ctx.auth, ...convexAuth(ctx) },
    identity: await validateAdmin(ctx),
  }))
)
