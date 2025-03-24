import { render } from "@react-email/render"
import type { ReactElement } from "react"

import env from "@init/env/email"
import { logger, styles } from "@init/observability/logger"
import { Fault } from "@init/utils/fault"

import client from "./client"

export async function sendEmail({
  body,
  emails,
  subject,
  sendAt,
  from = env.EMAIL_FROM,
}: {
  emails: string[]
  subject: string
  // Setting the body as unknown and then casting it later to a ReactElement to
  // allow for any type of ReactElement, since Hono's JSX leads to type errors.
  body: ReactElement
  sendAt?: Date | string
  from?: string
}) {
  if (env.MOCK_RESEND) {
    const text = await render(body, { plainText: true })
    mockEmail(emails, text)

    return
  }

  const { error } = await client.emails.send({
    from,
    to: emails,
    react: body as ReactElement,
    subject,
    scheduledAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
  })

  if (error) {
    throw Fault.from(error)
      .withTag("SEND_EMAIL_ERROR")
      .withDescription(
        error.message,
        `Unable to send email to ${emails.join(", ")}`
      )
      .withContext({
        from,
        to: emails,
        subject,
      })
  }
}

/**
 * Queues an email to be sent later using Upstash Qstash.
 */
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
  if (env.MOCK_RESEND) {
    const text = await render(body, { plainText: true })

    mockEmail(emails, text, true)

    return
  }

  const { default: q, resend } = await import("@init/queue/messages")

  await q.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: env.RESEND_API_KEY }),
    },
    body: {
      from,
      to: emails,
      subject,
      react: body,
    },
  })
}

function mockEmail(emails: string[], html: string, isQueued = false) {
  logger.warn(styles.bold.yellowBright("📪 env.MOCK_RESEND is set!"))

  if (isQueued) {
    logger.info(styles.green("📫 Queueing email to", emails.join(", ")))
  } else {
    logger.info(styles.green("📫 Sending email to", emails.join(", ")))
  }

  logger.info(styles.green("📝 Email content:"))
  logger.info(styles.gray("----------------------------------------"))
  logger.info(styles.gray.italic(html))
  logger.info(styles.gray("----------------------------------------"))
}
