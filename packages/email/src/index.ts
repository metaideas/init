import { render } from "@react-email/render"
import { SendEmailError } from "@this/common/errors"
import env from "@this/env/email.server"
import { logger } from "@this/observability/logger"
import { publishJob, resend } from "@this/queue/jobs"
import chalk from "chalk"
import type { ReactElement } from "react"

import client from "#client.ts"

export async function sendEmail({
  body,
  emails,
  subject,
  sendAt,
  from = env.EMAIL_FROM,
}: {
  emails: string[]
  subject: string
  body: ReactElement
  sendAt?: Date | string
  from?: string
}) {
  const html = await render(body)

  if (env.MOCK_RESEND) {
    mockEmail(emails, html)

    return
  }

  const { error } = await client.emails.send({
    from,
    to: emails,
    html,
    subject,
    scheduledAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
  })

  if (error) {
    throw new SendEmailError(
      { name: error.name, message: error.message, emails },
      error
    )
  }
}

export async function queueEmail({
  emails,
  subject,
  body,
  from = env.EMAIL_FROM,
}: {
  emails: string[]
  subject: string
  from?: string
  body: ReactElement
}) {
  const html = await render(body)

  if (env.MOCK_RESEND) {
    mockEmail(emails, html)

    return
  }

  await publishJob({
    api: {
      name: "email",
      provider: resend({ token: env.RESEND_API_KEY }),
    },
    body: {
      from,
      to: emails,
      subject,
      html,
    },
  })
}

function mockEmail(emails: string[], html: string) {
  logger.warn(chalk.bold.yellowBright("📪 env.MOCK_RESEND is set!"))
  logger.info(chalk.green("📫 Queuing email to", emails))
  logger.info(chalk.green("📝 Email content:"))
  logger.info(chalk.gray("----------------------------------------"))
  logger.info(chalk.gray.italic(html))
  logger.info(chalk.gray("----------------------------------------"))
}
