import { render } from "@react-email/render"
import type { ReactElement } from "react"

import env from "@init/env/email"
import { logger, styles } from "@init/observability/logger"
import { Fault } from "@init/utils/fault"

import client from "./client"

export async function sendEmail(
  body: ReactElement,
  {
    emails,
    subject,
    sendAt,
    from = env.EMAIL_FROM,
    queue = false,
  }: {
    emails: string[]
    subject: string
    sendAt?: Date | string
    from?: string
    /**
     * If true, the email will be queued to be sent later using Upstash Qstash.
     *
     * @default false
     */
    queue?: boolean
  }
) {
  if (env.MOCK_RESEND) {
    const text = await render(body, { plainText: true })
    mockEmail(emails, text)

    return
  }

  if (queue) {
    const { default: queue, resend } = await import("@init/queue/messages")

    await queue.publishJSON({
      api: {
        name: "email",
        provider: resend({ token: env.RESEND_API_KEY }),
      },
      body: {
        from,
        to: emails,
        subject,
        react: body,
        sendAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
      },
    })

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
