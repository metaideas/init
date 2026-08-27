import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_APP_NAME,
  AUTH_COOKIE_PREFIX,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { sendEmail } from "@init/email/client"
import PasswordReset from "@init/email/templates/password-reset"
import { ENV } from "#shared/env.generated.ts"
import { allowedOrigins, baseUrl } from "#shared/utils.ts"

export const auth = createAuth({
  // The app's auth instance shares the localhost cookie jar during
  // development, so this instance namespaces its cookies to keep the two
  // sessions from clobbering each other.
  advanced: { ...AUTH_ADVANCED_OPTIONS, cookiePrefix: `${AUTH_COOKIE_PREFIX}-api` },
  appName: AUTH_APP_NAME,
  basePath: "/auth",
  baseURL: baseUrl,
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
  plugins: [admin(), organization()],
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
  trustedOrigins: allowedOrigins,
})

export type Auth = typeof auth
export type Session = Auth["$Infer"]["Session"]
