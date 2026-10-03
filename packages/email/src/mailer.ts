import type { Logger } from "@init/core/services/logging"
import { SendEmailError } from "@init/core/errors"
import { render } from "@react-email/render"
import type { EmailTransport } from "#transports.ts"
import { type TemplateName, type TemplateProps, templates } from "#registry.ts"

export function createMailer({ from, logger, transport }: MailerOptions) {
  return {
    async send<Name extends TemplateName>(
      name: Name,
      props: TemplateProps<Name>,
      options: SendOptions
    ) {
      const { element, subject } = templates[name](props)
      const [html, text] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
      ])

      try {
        const { id } = await transport.send({
          from: options.from ?? from,
          html,
          subject,
          text,
          to: options.to,
        })

        logger?.info({ id, message: "Email sent", scope: "email", template: name })

        return { id }
      } catch (error) {
        throw new SendEmailError({ template: name, to: options.to }).withCause(error)
      }
    },
  }
}

export type Mailer = ReturnType<typeof createMailer>

export type { TemplateName, TemplateProps } from "#registry.ts"

type MailerOptions = {
  from: string
  transport: EmailTransport
  logger?: Logger
}

type SendOptions = {
  to: string[]
  from?: string
}
