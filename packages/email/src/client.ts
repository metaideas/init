import type { ReactNode } from "react"
import { SendEmailError, BatchSendEmailError } from "@init/core/errors"
import { getLogger, LoggerCategory } from "@init/observability/logger"
import { singleton } from "@init/utils/singleton"
import { render } from "@react-email/render"
import { addMilliseconds } from "date-fns"
import { type TimeExpression, ms } from "qte"
import { Resend } from "resend"
import { ENV } from "./env.generated.ts"

type EmailSendParams = {
  emails: string[]
  subject: string
  sendAt?: Date | TimeExpression
  from?: string
}

export const email = singleton("email", () => new Resend(ENV.RESEND_API_KEY))

const logger = getLogger(LoggerCategory.EMAIL)

export async function sendEmail(body: ReactNode, params: EmailSendParams) {
  const { emails, subject, sendAt, from = ENV.EMAIL_FROM } = params

  if (ENV.MOCK_RESEND) {
    await previewEmail(body, { emails, from, sendAt, subject })

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
          : addMilliseconds(new Date(), ms(sendAt)).toISOString(),
    subject,
    to: emails,
  })

  if (error) {
    throw new SendEmailError({
      emails,
      from,
      subject,
      text: await render(body, { plainText: true }),
    })
  }

  return data
}

export async function batchEmails(payload: Array<EmailSendParams & { body: ReactNode }>) {
  if (ENV.MOCK_RESEND) {
    const promises = payload.map(async ({ body, ...params }, index) => {
      const { emails, subject, sendAt, from = ENV.EMAIL_FROM } = params

      await previewEmail(body, { emails, from, sendAt, subject })

      return { id: `mock-id-${index}` }
    })

    return await Promise.all(promises)
  }

  const { data, error } = await email.batch.send(
    payload.map(({ body, emails, subject, sendAt, from = ENV.EMAIL_FROM }) => ({
      from,
      react: body,
      scheduledAt:
        sendAt === undefined
          ? undefined
          : sendAt instanceof Date
            ? sendAt.toISOString()
            : addMilliseconds(new Date(), ms(sendAt)).toISOString(),
      subject,
      to: emails,
    }))
  )

  if (error) {
    throw new BatchSendEmailError({
      emails: payload.flatMap(({ emails }) => emails),
      from: ENV.EMAIL_FROM,
      subject: payload.map(({ subject }) => subject).join(", "),
    })
  }

  return data.data
}

async function previewEmail(body: ReactNode, { emails, from, sendAt, subject }: EmailSendParams) {
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
}
