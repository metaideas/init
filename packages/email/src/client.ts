import type { ReactNode } from "react"
import { resend } from "@init/env/presets"
import { logger } from "@init/observability/logger"
import { type Duration, toMilliseconds } from "@init/utils/duration"
import { singleton } from "@init/utils/singleton"
import { render } from "@react-email/render"
import { addMilliseconds } from "date-fns"
import { Resend } from "resend"

type EmailSendParams = {
  emails: string[]
  subject: string
  sendAt?: Date | Duration
  from?: string
}

export const email = singleton("email", () => new Resend(resend().RESEND_API_KEY))

export async function sendEmail(body: ReactNode, params: EmailSendParams) {
  const env = resend()
  const { emails, subject, sendAt, from = env.EMAIL_FROM } = params

  if (env.MOCK_RESEND) {
    const text = await render(body, { plainText: true })

    logger.warn`📪 MOCK_RESEND is enabled - emails will not be sent`
    logger.info`📝 Email content preview:`
    logger.info`FROM: ${from}`
    logger.info`TO: ${emails.join(", ")}`
    logger.info`SUBJECT: ${subject}`
    logger.info`SEND AT: ${sendAt}`
    logger.info`${"=".repeat(50)}`
    logger.info`${text}`
    logger.info`${"=".repeat(50)}`

    return { id: "mock-id" }
  }

  const { data, error } = await email.emails.send({
    from,
    react: body,
    scheduledAt:
      sendAt === undefined
        ? undefined
        : sendAt instanceof Date
          ? sendAt.toISOString()
          : addMilliseconds(new Date(), toMilliseconds(sendAt)).toISOString(),
    subject,
    to: emails,
  })

  if (error) {
    throw new Error(`Unable to send email to ${emails.join(", ")}: ${error.message}`)
  }

  return data
}

export async function batchEmails(payload: Array<EmailSendParams & { body: ReactNode }>) {
  const env = resend()

  if (env.MOCK_RESEND) {
    const promises = payload.map(async ({ body, ...params }, index) => {
      const { emails, subject, sendAt, from = env.EMAIL_FROM } = params

      const text = await render(body, { plainText: true })
      logger.warn`📪 MOCK_RESEND is enabled - emails will not be sent`
      logger.info`📝 Email content preview:`
      logger.info`FROM: ${from}`
      logger.info`TO: ${emails.join(", ")}`
      logger.info`SUBJECT: ${subject}`
      logger.info`SEND AT: ${sendAt}`
      logger.info`${"=".repeat(50)}`
      logger.info`${text}`
      logger.info`${"=".repeat(50)}`

      return { id: `mock-id-${index}` }
    })

    return await Promise.all(promises)
  }

  const { data, error } = await email.batch.send(
    payload.map(({ body, emails, subject, sendAt, from = env.EMAIL_FROM }) => ({
      from,
      react: body,
      scheduledAt:
        sendAt === undefined
          ? undefined
          : sendAt instanceof Date
            ? sendAt.toISOString()
            : addMilliseconds(new Date(), toMilliseconds(sendAt)).toISOString(),
      subject,
      to: emails,
    }))
  )

  if (error) {
    throw new Error(`Unable to send batch emails: ${error.message}`)
  }

  return data.data ?? []
}
