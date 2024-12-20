import { captureException } from "@sentry/core"
import { logger } from "#logger/index.ts"

export function reportError(error: unknown): {
  sentryId: string | undefined
  message: string
} {
  let message = "An error occurred"

  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === "object" && "message" in error) {
    message = error.message as string
  } else {
    message = String(error)
  }

  let sentryId: string | undefined

  try {
    sentryId = captureException(error)
    logger.error(`Parsing error: ${message}`)
  } catch (e) {
    // biome-ignore lint/suspicious/noConsole: Need console here
    console.error("Error parsing error:", e)
  }

  return { sentryId, message }
}
