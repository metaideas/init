import type { ErrorResponse } from "resend"
import { EmailFault } from "@init/core/errors"
import { createTransport } from "nodemailer"
import { Resend } from "resend"

/**
 * Resend 4xx errors that can clear on their own. Server errors and network failures are temporary
 * too. Everything else, such as a validation error or an exhausted quota, fails the same way on
 * every attempt.
 */
const RETRYABLE_RESEND_ERRORS = new Set<ErrorResponse["name"]>([
  "concurrent_idempotent_requests",
  "rate_limit_exceeded",
])

export function resendTransport(apiKey: string): EmailTransport {
  const resend = new Resend(apiKey)

  return {
    async send(message, { idempotencyKey }) {
      const { data, error } = await resend.emails.send(message, { idempotencyKey })

      if (error) {
        throw EmailFault.wrap(error)
          .as("EmailDeliveryError", {
            isRetryable:
              error.statusCode === null
              || error.statusCode >= 500
              || RETRYABLE_RESEND_ERRORS.has(error.name),
            transport: "resend",
          })
          .withMessage(error.message)
      }

      return { id: data.id }
    },
  }
}

/**
 * Sends through any SMTP server. Local development points it at Mailpit from Docker Compose.
 */
export function smtpTransport(url: string): EmailTransport {
  const smtp = createTransport(url)

  return {
    async send(message) {
      try {
        const { messageId } = await smtp.sendMail(message)

        return { id: messageId }
      } catch (error) {
        throw EmailFault.wrap(error).as("EmailDeliveryError", {
          isRetryable: !isPermanentSmtpFailure(error),
          transport: "smtp",
        })
      }
    },
  }
}

/**
 * Keeps sent messages in memory for tests.
 */
export function memoryTransport(): EmailTransport & { sent: EmailMessage[] } {
  const sent: EmailMessage[] = []

  return {
    send(message) {
      sent.push(message)

      return Promise.resolve({ id: `memory-${sent.length}` })
    },
    sent,
  }
}

/**
 * Sends through Resend when an API key is configured and through SMTP otherwise.
 */
export function selectTransport({ resendApiKey, smtpUrl }: TransportConfig): EmailTransport {
  if (resendApiKey) {
    return resendTransport(resendApiKey)
  }

  if (smtpUrl) {
    return smtpTransport(smtpUrl)
  }

  throw EmailFault.create("EmailConfigurationError").withMessage(
    "Set RESEND_API_KEY or SMTP_URL to send email."
  )
}

// SMTP reply codes from 500 to 599 reject the message for good. Codes from 400 to 499 and
// connection errors without a reply code are temporary.
function isPermanentSmtpFailure(error: unknown) {
  if (!(error instanceof Error) || !("responseCode" in error)) {
    return false
  }

  return typeof error.responseCode === "number" && error.responseCode >= 500
}

export type EmailMessage = {
  from: string
  to: string[]
  subject: string
  html: string
  text: string
}

export type EmailTransport = {
  send: (message: EmailMessage, context: SendContext) => Promise<{ id: string }>
}

/**
 * Per-send details for transports. The idempotency key stays the same across retries of one send.
 */
export type SendContext = {
  idempotencyKey: string
}

type TransportConfig = {
  resendApiKey?: string
  smtpUrl?: string
}
