// Authentication errors
export type AuthenticationError = {
  "auth.unauthenticated": { requestId?: string }
  "auth.unauthorized": { requestId?: string; userId?: string }
}

export type EmailError = {
  "email.send_failed": {
    emails: string[]
    subject: string
    from?: string
    text: string
  }
  "email.batch_send_failed": {
    emails: string[]
    subject: string
    from?: string
  }
}

export type DurationError = {
  "duration.invalid_parse_input": { value: string }
  "duration.invalid_format_input": { value: unknown }
}

export type AssertError = {
  "assert.unreachable": { value: unknown }
  "assert.condition_failed": { condition: string }
}

declare module "faultier" {
  interface FaultRegistry extends AuthenticationError, EmailError, DurationError, AssertError {}
}

export { Fault } from "faultier"
export { extend } from "faultier/extend"
