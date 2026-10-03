import { createMailer } from "@init/email/mailer"
import { selectTransport } from "@init/email/transports"
import { ENV } from "#shared/env.generated.ts"
import { log } from "#shared/logger.ts"

export const mailer = createMailer({
  from: ENV.EMAIL_FROM,
  logger: log,
  transport: selectTransport({ resendApiKey: ENV.RESEND_API_KEY, smtpUrl: ENV.SMTP_URL }),
})
