import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_APP_NAME,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { tanstackStartCookies as cookies } from "@init/auth/integrations/start"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { sendEmail } from "@init/email/client"
import PasswordReset from "@init/email/templates/password-reset"
import { ENV } from "#shared/env.generated.ts"

const trustedOrigins = ENV.AUTH_TRUSTED_ORIGINS

export const auth = createAuth({
  advanced: AUTH_ADVANCED_OPTIONS,
  appName: AUTH_APP_NAME,
  basePath: "/api/auth",
  baseURL: ENV.PUBLIC_BASE_URL,
  database: databaseAdapter(database()),
  emailAndPassword: {
    ...AUTH_EMAIL_AND_PASSWORD_OPTIONS,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(PasswordReset({ resetUrl: url }), {
        emails: [user.email],
        subject: `Reset your ${AUTH_APP_NAME} password`,
      })
    },
  },
  plugins: [admin(), organization(), cookies()],
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
