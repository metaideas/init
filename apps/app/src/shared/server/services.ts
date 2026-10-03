import { AUTH_APP_NAME } from "@init/auth/constants"
import { createServerAuth } from "@init/auth/server"
import { tanstackStartCookies } from "@init/auth/start"
import { createDatabase } from "@init/database/client"
import { createMailer } from "@init/email/mailer"
import { selectTransport } from "@init/email/transports"
import { ENV } from "#shared/env.generated.ts"
import { log } from "#shared/logger.ts"

export const database = createDatabase({ logger: log, url: ENV.DATABASE_URL })

export const mailer = createMailer({
  from: ENV.EMAIL_FROM,
  logger: log,
  transport: selectTransport({ resendApiKey: ENV.RESEND_API_KEY, smtpUrl: ENV.SMTP_URL }),
})

export const auth = createServerAuth({
  basePath: "/api/auth",
  baseUrl: ENV.PUBLIC_BASE_URL,
  database,
  logger: log,
  plugins: [tanstackStartCookies()],
  secret: ENV.AUTH_SECRET,
  // The mailer logs a failed send. The reset response stays the same either way, so it does not
  // reveal whether the email went out.
  sendPasswordReset: ({ email, url }) =>
    mailer.send("password-reset", { appName: AUTH_APP_NAME, resetUrl: url }, { to: [email] }),
  socialProviders: {
    github: { clientId: ENV.GITHUB_CLIENT_ID, clientSecret: ENV.GITHUB_CLIENT_SECRET },
    google: { clientId: ENV.GOOGLE_CLIENT_ID, clientSecret: ENV.GOOGLE_CLIENT_SECRET },
  },
  trustedOrigins: ENV.AUTH_TRUSTED_ORIGINS,
})
