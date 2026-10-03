import * as Sentry from "@sentry/node"

export { startSpan } from "@sentry/node"

export function trace<T>(
  name: string,
  run: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return Sentry.startSpan({ attributes, name, op: "function" }, run)
}

export function traceContext(span: Sentry.Span) {
  const { traceId, spanId } = span.spanContext()
  return { spanId, traceId }
}
