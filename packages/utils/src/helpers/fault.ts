/**
 * Fault is an error handling class providing rich context preservation
 * and safe error reporting in applications. It combines debugging
 * capabilities with secure user communication patterns.
 *
 * Inspired by: https://github.com/unkeyed/unkey/tree/main/go/pkg/fault
 */
export class Fault extends Error {
  #tag: FaultTag
  #details?: string
  #message?: string
  #location?: string
  #metadata: Record<string, unknown> = {}

  constructor(initial: Error | string) {
    const isInitialError = initial instanceof Error

    super(isInitialError ? initial.message : String(initial), {
      cause: isInitialError ? initial : undefined,
    })

    // Fix instanceof issues with extending Error
    Object.setPrototypeOf(this, new.target.prototype)

    // Capture location (only first non-Fault line)
    const stackLines = this.stack?.split("\n") || []
    // Skip the Error: message line and any lines from the Fault class
    const locationLine = stackLines.find(
      line => line.trim().startsWith("at") && !line.includes("Fault.")
    )

    this.#location = locationLine?.trim() || undefined
    this.#tag = "UNKNOWN_ERROR"
  }

  /**
   * Create a new Fault from an error or message
   */
  static from(initial: Error | string): Fault {
    return new Fault(initial)
  }

  /**
   * Get the tag associated with this fault
   */
  get tag(): FaultTag | undefined {
    return this.#tag
  }

  /**
   * Get the details (additional context for developers)
   */
  get details(): string | undefined {
    return this.#details
  }

  /**
   * Get the message (safe for user display)
   * Falls back to original error message if no custom message is set
   */
  override get message(): string {
    return this.#message ?? super.message
  }

  /**
   * Get the location where the fault originated
   */
  get location(): string | undefined {
    return this.#location
  }

  /**
   * Get the metadata associated with this fault
   */
  get metadata(): Record<string, unknown> {
    // Return a copy to prevent mutation
    return { ...this.#metadata }
  }

  /**
   * HTTP status code based on the tag
   */
  get statusCode(): number {
    switch (this.#tag) {
      case "AUTHENTICATION_ERROR":
        return 401
      case "AUTHORIZATION_ERROR":
        return 403
      case "NOT_FOUND":
        return 404
      case "RATE_LIMIT_EXCEEDED":
        return 429
      case "DATABASE_ERROR":
      case "INTERNAL_ERROR":
      case "SEND_EMAIL_ERROR":
      case "VERIFICATION_ERROR":
        return 500
      default:
        return 500
    }
  }

  /**
   * Add a tag to classify this error
   */
  withTag(tag: FaultTag): this {
    this.#tag = tag
    return this
  }

  /**
   * Add details and an optional user-facing message to this error
   * @param details Detailed description for logging/debugging
   * @param message Optional custom message that can be shown to users; if omitted, original error message is used
   */
  withDescription(details: string, message?: string): this {
    this.#details = details
    if (message !== undefined) {
      // This assignment is necessary to override the Error.message property
      // The getter will use this value instead of the value from super.message
      this.#message = message
      // Also need to update the inherited message property for toString() to work correctly
      super.message = message
    }
    return this
  }

  /**
   * Add details (developer context) to this error
   */
  withDetails(details: string): this {
    this.#details = details
    return this
  }

  /**
   * Add a single piece of metadata to this error
   */
  withMetadata(key: string, value: unknown): this {
    this.#metadata[key] = value
    return this
  }

  /**
   * Add multiple pieces of metadata to this error
   */
  withContext(data: Record<string, unknown>): this {
    for (const [key, value] of Object.entries(data)) {
      this.#metadata[key] = value
    }
    return this
  }

  /**
   * Serialize this error for logging
   */
  toJSON(): Record<string, unknown> {
    let causeValue = this.cause

    if (this.cause instanceof Error) {
      if (this.cause instanceof Fault) {
        causeValue = this.cause.toJSON()
      } else {
        causeValue = {
          name: this.cause.name,
          message: this.cause.message,
          stack: this.cause.stack,
        }
      }
    }

    return {
      name: this.name,
      message: this.message,
      details: this.#details,
      tag: this.#tag,
      statusCode: this.statusCode,
      location: this.#location,
      metadata: { ...this.#metadata },
      cause: causeValue,
      stack: this.stack,
    }
  }

  getCauseChain(): Array<Error | unknown> {
    const chain: Array<Error | unknown> = []
    let current: unknown = this

    while (current instanceof Error && current.cause) {
      chain.push(current)
      current = current.cause
    }

    if (current) {
      chain.push(current)
    }
    return chain
  }
}

export type FaultTag =
  | "ASSERTION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "SEND_EMAIL_ERROR"
  | "VERIFICATION_ERROR"
  | "UNKNOWN_ERROR"
