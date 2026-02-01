// Separated this from the main auth.ts file to avoid environment variable
// errors when trying to use the auth options inside the better auth component..

import type { GenericCtx } from "@convex-dev/better-auth"
import type { AuthOptions } from "@init/auth/server"
import { createClient } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { admin, anonymous, organization } from "@init/auth/server/plugins"
import { APP_ID, APP_NAME, SESSION_EXPIRES_IN, SESSION_UPDATE_AGE } from "@init/utils/constants"
import type { DataModel } from "#functions/_generated/dataModel.js"
import { components } from "#functions/_generated/api.js"
import authConfig from "#functions/auth.config.ts"
import authSchema from "#functions/components/better-auth/schema.ts"

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
  local: { schema: authSchema },
})

export const authOptions = (ctx: GenericCtx<DataModel>) =>
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
      expiresIn: SESSION_EXPIRES_IN,
      updateAge: SESSION_UPDATE_AGE,
    },
  }) satisfies AuthOptions
