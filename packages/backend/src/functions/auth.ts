import type { GenericCtx } from "@convex-dev/better-auth"
import { createAuth } from "@init/auth/server"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { authComponent, createAuthOptions } from "#functions/shared/auth.ts"
import env from "#functions/shared/env.ts"

export { authComponent } from "#functions/shared/auth.ts"

export const { onCreate, onDelete, onUpdate } = authComponent.triggersApi()

export const convexAuth = (ctx: GenericCtx<DataModel>) =>
  createAuth({
    ...createAuthOptions(ctx),
    baseURL: env.CONVEX_SITE_URL,
    secret: env.AUTH_SECRET,
    trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  })
