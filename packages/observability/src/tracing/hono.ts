import * as Sentry from "@sentry/node"
import { createMiddleware } from "hono/factory"
import { routePath } from "hono/route"
import type { LoggerVariables } from "#logger/hono.ts"
import { traceContext } from "#tracing/index.ts"

export function traceRequest() {
  return createMiddleware<LoggerVariables>((c, next) =>
    Sentry.withIsolationScope(() =>
      Sentry.continueTrace(
        {
          baggage: c.req.header("baggage"),
          sentryTrace: c.req.header("sentry-trace"),
        },
        () =>
          Sentry.startSpan(
            {
              attributes: { "http.request.method": c.req.method },
              name: `${c.req.method} request`,
              op: "http.server",
            },
            async (span) => {
              c.var.log.set(traceContext(span))

              try {
                await next()
              } finally {
                const route = routePath(c, -1)
                span.updateName(`${c.req.method} ${route || "unmatched"}`)
                if (route) {
                  span.setAttribute("http.route", route)
                }
                Sentry.setHttpStatus(span, c.res.status)
                if (c.error) {
                  span.setStatus({ code: 2, message: "internal_error" })
                }
              }
            }
          )
      )
    )
  )
}
