import { TaggedError } from "better-result"

export class SendEmailError extends TaggedError("SendEmailError")<{
  emails: string[]
  subject: string
  from?: string
  text: string
}>() {}

export class BatchSendEmailError extends TaggedError("BatchSendEmailError")<{
  emails: string[]
  subject: string
  from?: string
}>() {}

export type EmailError = SendEmailError | BatchSendEmailError
