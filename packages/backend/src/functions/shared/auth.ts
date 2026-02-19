import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth"
import type { AuthOptions } from "@init/auth/server"
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { AUTH_APP_NAME, AUTH_COOKIE_PREFIX } from "@init/auth/constants"
import { admin, anonymous, organization } from "@init/auth/server/plugins"
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
      cookiePrefix: AUTH_COOKIE_PREFIX,
      database: { generateId: false },
    },
    appName: AUTH_APP_NAME,
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
