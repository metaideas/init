/**
 * Custom error class for handling errors in a consistent way.
 * Use this to create specific error types for your application.
 */
class CustomError extends Error {
  constructor(name: string, message: string, cause?: unknown) {
    super(message)
    this.name = name
    if (cause) {
      this.cause = cause
    }
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AssertionError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("AssertionError", message, cause)
  }
}

export class AuthError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("AuthError", message, cause)
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("DatabaseError", message, cause)
  }
}

export class InternalError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("InternalError", message, cause)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("NotFoundError", message, cause)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("RateLimitError", message, cause)
  }
}

export class SendEmailError extends CustomError {
  constructor(
    {
      emails,
      name,
      message,
    }: { emails: string[]; name: string; message: string },
    cause?: unknown
  ) {
    super(
      "SendEmailError",
      `Error sending email to ${emails.join(", ")}.\n${name}: ${message}`,
      cause
    )
  }
}

export class VerificationError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("VerificationError", message, cause)
  }
}
