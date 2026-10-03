import {
  AUTH_ADVANCED_OPTIONS,
  AUTH_API_COOKIE_PREFIX,
  AUTH_APP_NAME,
  AUTH_EMAIL_AND_PASSWORD_OPTIONS,
  AUTH_SESSION_OPTIONS,
} from "@init/auth/constants"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { database } from "@init/database/client"
import { ENV } from "#shared/env.generated.ts"
import { log } from "#shared/logger.ts"
import { mailer } from "#shared/services.ts"
import { allowedOrigins, baseUrl } from "#shared/utils.ts"

export const auth = createAuth({
  advanced: {
    ...AUTH_ADVANCED_OPTIONS,
    cookiePrefix: AUTH_API_COOKIE_PREFIX,
    crossSubDomainCookies: {
      domain: ENV.AUTH_COOKIE_DOMAIN,
      enabled: ENV.AUTH_COOKIE_DOMAIN !== undefined,
    },
  },
  appName: AUTH_APP_NAME,
  basePath: "/auth",
  baseURL: baseUrl,
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
  logger: {
    level: "warn",
    log: (level, message, ...details) => {
      log[level]({ message, scope: "auth", ...(details.length > 0 ? { details } : {}) })
    },
  },
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
