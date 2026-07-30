import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth"
import type { AuthOptions } from "@init/auth/server"
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_APP_NAME,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { admin, anonymous, organization } from "@init/auth/server/plugins"
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
    advanced: AUTH_ADVANCED_OPTIONS,
    appName: AUTH_APP_NAME,
    database: authComponent.adapter(ctx),
    emailAndPassword: AUTH_EMAIL_AND_PASSWORD_OPTIONS,
    plugins: [anonymous(), admin(), organization(), convex({ authConfig })],
    session: AUTH_SESSION_OPTIONS,
  }) satisfies AuthOptions
