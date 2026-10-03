import * as Sentry from "@sentry/node"
import type { RequestLogger } from "#logger/index.ts"
import { createRequestLogger } from "#logger/index.ts"
import { traceContext } from "#tracing/index.ts"

type ProcedureResult = { ok: true } | { ok: false; error: Error & { code: string } }

export function traceProcedure<T extends ProcedureResult>(
  options: { path: string; type: string; parentLog: RequestLogger },
  run: (log: ReturnType<typeof createRequestLogger<Record<string, unknown>>>) => T | Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      attributes: {
        "rpc.method": options.path,
        "rpc.system": "trpc",
        "rpc.type": options.type,
      },
      name: options.path,
      op: "rpc.server",
    },
    async (span) => {
      const log = createRequestLogger()
      log.set({
        ...traceContext(span),
        event: "rpc.procedure",
        parentRequestId: options.parentLog.getContext().requestId,
        rpc: { method: options.path, type: options.type },
      })

      try {
        const result = await run(log)
        span.setAttribute("rpc.ok", result.ok)
        log.set({ outcome: result.ok ? "success" : "failure" })

        if (!result.ok) {
          span.setAttribute("rpc.error_code", result.error.code)
          span.setStatus({
            code: 2,
            message:
              result.error.code === "INTERNAL_SERVER_ERROR" ? "internal_error" : "unknown_error",
          })
          log.set({ error: { code: result.error.code } })
          if (result.error.code === "INTERNAL_SERVER_ERROR") {
            log.error(result.error)
            Sentry.captureException(result.error)
          } else {
            log.setLevel("warn")
          }
        }

        return result
      } catch (error) {
        log.set({ outcome: "failure" })
        log.error(error instanceof Error ? error : "Procedure failed")
        Sentry.captureException(error)
        throw error
      } finally {
        log.emit()
      }
    }
  )
}
