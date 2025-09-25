export function parseError(error: unknown, fallback = "An error occurred") {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export class CustomError extends Error {
  context: Record<string, unknown>

  constructor(message: string, context: Record<string, unknown>) {
    super(message)
    this.name = "CustomError"
    this.context = context
  }
}
