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
} from "../_generated/server"
import schema from "../schema"
import { convexAuth } from "./auth"

export const vv = typedV(schema)

const publicContext = customCtx(async () => ({
  logger: await import("@init/observability/logger").then((m) =>
    m.logger.getChild("convex")
  ),
}))

export const publicQuery = customQuery(query, publicContext)
export const publicMutation = customMutation(mutation, publicContext)
export const publicAction = customAction(action, publicContext)

function validateIdentity(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error("User is not authenticated")
  }

  return { identity }
}

export const protectedQuery = customQuery(
  query,
  customCtx(async (ctx) => ({
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
    auth: {
      ...ctx.auth,
      ...convexAuth(ctx),
    },
    identity: await validateIdentity(ctx),
  }))
)
export const protectedAction = customAction(
  action,
  customCtx(async (ctx) => ({
    auth: {
      ...ctx.auth,
      ...convexAuth(ctx),
    },
    identity: await validateIdentity(ctx),
  }))
)
