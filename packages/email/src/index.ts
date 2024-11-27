import { render } from "@react-email/render"
import { SendEmailError } from "@this/common/errors"
import env from "@this/env/resend"
import { logger } from "@this/observability/logger"
import chalk from "chalk"
import type { ReactElement } from "react"

import resend from "#client.ts"

export async function sendEmail(
  email: string,
  subject: string,
  body: ReactElement,
  sendAt?: Date | string
) {
  const content = await render(body, { plainText: env.MOCK_RESEND })

  if (env.MOCK_RESEND) {
    logger.warn(chalk.bold.yellowBright("📪 env.MOCK_RESEND is set!"))
    logger.info(chalk.green("📫 Sending email to", email))
    logger.info(chalk.green("📝 Email content:"))
    logger.info(chalk.gray("----------------------------------------"))
    logger.info(chalk.gray.italic(content))
    logger.info(chalk.gray("----------------------------------------"))

    return
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    html: content,
    scheduledAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
  })

  if (error) {
    throw new SendEmailError(
      { name: error.name, message: error.message, email },
      error
    )
  }
}
