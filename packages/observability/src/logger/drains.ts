import type { DrainContext } from "evlog"
import { createDrainPipeline } from "evlog/pipeline"
import { createSentryDrain } from "evlog/sentry"
import { ENV } from "#env.generated.ts"

/**
 * Server-side drain shipping wide events to Sentry, wrapped in a pipeline
 * with batching and retry. Returns `undefined` when no DSN is configured so
 * apps can pass the result straight to `createLogger`.
 *
 * Server-only: reads the observability environment. Client apps log to the
 * console and rely on Sentry's browser SDK for error capture.
 */
export function buildDrain() {
  if (!ENV.SENTRY_DSN) {
    return
  }

  const pipeline = createDrainPipeline<DrainContext>({
    batch: { intervalMs: 5000, size: 50 },
    retry: { maxAttempts: 3 },
  })

  return pipeline(createSentryDrain({ dsn: ENV.SENTRY_DSN }))
}
