// Authentication errors
export type AuthenticationError = {
  "AUTH.UNAUTHENTICATED": { requestId?: string }
  "AUTH.UNAUTHORIZED": { requestId?: string; userId?: string }
}

export type EmailError = {
  "EMAIL.SEND_FAILED": {
    emails: string[]
    subject: string
    from?: string
    text: string
  }
  "EMAIL.BATCH_SEND_FAILED": {
    emails: string[]
    subject: string
    from?: string
  }
}

declare module "faultier" {
  interface FaultRegistry extends AuthenticationError, EmailError {
    TEST_ERROR: { timestamp: number }
  }
}

export { Fault } from "faultier"
export { extend } from "faultier/extend"
