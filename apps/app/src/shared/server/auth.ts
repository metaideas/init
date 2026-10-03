import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_APP_NAME,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { tanstackStartCookies as cookies } from "@init/auth/start"
import { database } from "@init/database/client"
import { ENV } from "#shared/env.generated.ts"
import { mailer } from "#shared/server/services.ts"

const trustedOrigins = ENV.AUTH_TRUSTED_ORIGINS

export const auth = createAuth({
  advanced: AUTH_ADVANCED_OPTIONS,
  appName: AUTH_APP_NAME,
  basePath: "/api/auth",
  baseURL: ENV.PUBLIC_BASE_URL,
  database: databaseAdapter(database),
  emailAndPassword: {
    ...AUTH_EMAIL_AND_PASSWORD_OPTIONS,
    sendResetPassword: async ({ user, url }) => {
      await mailer.send(
        "password-reset",
        { appName: AUTH_APP_NAME, resetUrl: url },
        { to: [user.email] }
      )
    },
  },
  plugins: [cookies()],
  secret: ENV.AUTH_SECRET,
  session: AUTH_SESSION_OPTIONS,
  socialProviders: {
    github: {
      clientId: ENV.GITHUB_CLIENT_ID,
      clientSecret: ENV.GITHUB_CLIENT_SECRET,
      enabled: true,
    },
    google: {
      clientId: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      enabled: true,
    },
  },
  trustedOrigins,
})
