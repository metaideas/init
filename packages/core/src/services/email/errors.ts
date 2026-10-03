import * as Faultier from "faultier"

export class SendEmailError extends Faultier.Tagged("SendEmailError")<{
  template: string
  to: string[]
}>() {}

export const EmailFault = Faultier.registry({ SendEmailError })
export type EmailError = SendEmailError
