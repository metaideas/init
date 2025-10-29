type FaultCode =
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "FEATURE_FLAG_ERROR"
  | "RATE_LIMIT_ERROR"
  | (string & {})

type FaultOptions = {
  /**
   * The user-facing message (public, safe for API responses)
   */
  public?: string
  /**
   * An internal debugging message (not exposed to users)
   */
  internal?: string
  /**
   * The context of the error
   */
  context?: Record<string, unknown>
  /**
   * The cause of the error
   */
  cause?: Error
}

/**
 * Fault - Clean error handling with internal/public message separation
 *
 * - message: User-facing message (public, safe for API responses)
 * - internal: Internal debugging information (never exposed to users)
 * - name/code: Error classification code
 */
export class Fault extends Error {
  readonly internal?: string
  override readonly cause?: Error
  readonly context: Record<string, unknown>

  constructor(code: FaultCode, options: FaultOptions) {
    super(options?.public ?? "An unknown error occurred")
    this.name = code
    this.internal = options?.internal
    this.context = options?.context ?? {}
    this.cause = options?.cause

    Error.captureStackTrace?.(this, this.constructor)
  }

  /**
   * Wrap an existing error with additional context
   */
  static wrap(
    err: Error | unknown,
    code: FaultCode,
    options?: Omit<FaultOptions, "cause">
  ): Fault {
    const original = err instanceof Error ? err : new Error(String(err))

    return new Fault(code, {
      public: options?.public ?? original.message,
      internal: options?.internal,
      context: options?.context,
      cause: original,
    })
  }

  static isFault(error: unknown): error is Fault {
    return error instanceof Fault
  }

  /**
   * Get full debugging message (public + internal)
   */
  getDebugMessage(): string {
    const parts: string[] = [this.message]
    if (this.internal) {
      parts.push(this.internal)
    }
    return parts.join(" | ")
  }

  /**
   * Convert to JSON for logging/serialization
   */
  toJSON() {
    return {
      code: this.name,
      public: this.message,
      internal: this.internal,
      context: this.context,
      cause: this.cause?.message,
      stack: this.stack,
    }
  }
}
