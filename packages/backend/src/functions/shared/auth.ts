import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth"
import type { AuthOptions } from "@init/auth/server"
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { admin, anonymous, organization } from "@init/auth/server/plugins"
import { APP_ID, APP_NAME } from "@init/utils/constants"
import { seconds } from "qte"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { components, internal } from "#functions/_generated/api.js"
import authConfig from "#functions/auth.config.ts"
import authSchema from "#functions/components/better-auth/schema.ts"

const authFunctions: AuthFunctions = internal.auth

export const authComponent = createClient<DataModel, typeof authSchema>(components.auth, {
  authFunctions,
  local: { schema: authSchema },
})

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    advanced: {
      cookiePrefix: APP_ID,
      database: { generateId: false },
    },
    appName: APP_NAME,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      autoSignIn: true,
      enabled: true,
    },
    plugins: [anonymous(), admin(), organization(), convex({ authConfig })],
    session: {
      expiresIn: seconds("30d"),
      updateAge: seconds("15d"),
    },
  }) satisfies AuthOptions
