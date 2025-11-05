import { logger } from "@init/observability/logger"
import { type QstashClient, resend as resendQstash } from "@init/queue/messages"
import { render } from "@react-email/render"
import type { ReactElement } from "react"
import { Resend } from "resend"

export function createClient(
  apiKey: string,
  options: {
    /**
     * The default from address to use for emails.
     */
    from: string
    /**
     * If true, the email will be mocked and not sent.
     */
    mock?: boolean
  }
) {
  const resend = new Resend(apiKey)

  async function sendEmail(
    body: ReactElement,
    {
      emails,
      subject,
      sendAt,
      from = options.from,
      queue,
    }: {
      emails: string[]
      subject: string
      sendAt?: Date | string
      from?: string
      /**
       * If provided, the email will be queued to be sent later using Upstash Qstash.
       */
      queue?: QstashClient
    }
  ) {
    if (options?.mock) {
      const text = await render(body, { plainText: true })
      mockEmail(emails, text)

      return
    }

    if (queue) {
      await queue.publishJSON({
        api: {
          name: "email",
          provider: resendQstash({ token: apiKey }),
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

    const { error } = await resend.emails.send({
      from,
      to: emails,
      react: body as ReactElement,
      subject,
      scheduledAt: typeof sendAt === "string" ? sendAt : sendAt?.toISOString(),
    })

    if (error) {
      throw new Error(
        `Unable to send email to ${emails.join(", ")}: ${error.message}`
      )
    }
  }

  function mockEmail(emails: string[], html: string, isQueued = false) {
    logger.warn("📪 MOCK_RESEND is enabled - emails will not be sent")
    logger.info(
      `📫 ${isQueued ? "Would queue" : "Would send"} email to: ${emails.join(", ")}`
    )
    logger.info("📝 Email content preview:")
    logger.info("=".repeat(50))
    logger.info(html)
    logger.info("=".repeat(50))
  }

  return { resend, sendEmail }
}
