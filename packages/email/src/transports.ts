import { createTransport } from "nodemailer"
import { Resend } from "resend"

export function resendTransport(apiKey: string): EmailTransport {
  const resend = new Resend(apiKey)

  return {
    async send(message) {
      const { data, error } = await resend.emails.send(message)

      if (error) {
        throw new Error(error.message, { cause: error })
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
      const { messageId } = await smtp.sendMail(message)

      return { id: messageId }
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

  throw new Error("Configure RESEND_API_KEY or SMTP_URL to send email.")
}

export type EmailMessage = {
  from: string
  to: string[]
  subject: string
  html: string
  text: string
}

export type EmailTransport = {
  send: (message: EmailMessage) => Promise<{ id: string }>
}

type TransportConfig = {
  resendApiKey?: string
  smtpUrl?: string
}
