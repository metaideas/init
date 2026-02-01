import type { GenericCtx } from "@convex-dev/better-auth"
import { createAuth } from "@init/auth/server"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { authOptions } from "#functions/shared/auth/options.ts"
import env from "#functions/shared/env.ts"

export const convexAuth = (ctx: GenericCtx<DataModel>) =>
  createAuth({
    ...authOptions(ctx),
    baseURL: env.CONVEX_SITE_URL,
    secret: env.AUTH_SECRET,
    trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  })
