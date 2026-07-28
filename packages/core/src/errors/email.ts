import * as Faultier from "faultier"

export class SendEmailError extends Faultier.Tagged("SendEmailError")<{
  emails: string[]
  subject: string
  from?: string
  text: string
}>() {}

export class BatchSendEmailError extends Faultier.Tagged("BatchSendEmailError")<{
  emails: string[]
  subject: string
  from?: string
}>() {}

export const EmailFault = Faultier.registry({
  BatchSendEmailError,
  SendEmailError,
})
export type EmailError = SendEmailError | BatchSendEmailError
