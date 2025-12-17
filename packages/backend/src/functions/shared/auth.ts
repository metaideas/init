import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { createAuth } from "@init/auth/server"
import { components } from "../_generated/api"
import type { DataModel } from "../_generated/dataModel"
import authConfig from "../auth.config"
import env from "./env"

export const authComponent = createClient<DataModel>(components.betterAuth)

export function convexAuth(ctx: GenericCtx<DataModel>) {
  return createAuth(
    authComponent.adapter(ctx),
    {
      baseURL: env.SITE_URL,
      secret: env.AUTH_SECRET,
      trustedOrigins: ["init://"],
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
      },
    },

    [convex({ authConfig })]
  )
}
