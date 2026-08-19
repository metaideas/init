import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_APP_NAME,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { sendEmail } from "@init/email/client"
import PasswordReset from "@init/email/templates/password-reset"
import { log } from "@init/observability/logger"
import { ENV } from "#shared/env.generated.ts"
import { allowedOrigins, baseUrl } from "#shared/utils.ts"

export const auth = createAuth({
  advanced: AUTH_ADVANCED_OPTIONS,
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
  logger: {
    level: "warn",
    log: (level, message, ...details) => {
      log[level]({ message, scope: "auth", ...(details.length > 0 ? { details } : {}) })
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
