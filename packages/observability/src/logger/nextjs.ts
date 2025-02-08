import { geolocation, ipAddress, waitUntil } from "@vercel/functions"
import { StatusCodes } from "http-status-codes"
import { LogLevel, Logger } from "next-axiom"
import { headers } from "next/headers"
import type { NextFetchEvent, NextRequest, NextResponse } from "next/server"

import type { ActionMetadata } from "@this/validation/actions"

// We re-export the withAxiom configuration to use it Next.js without installing next-a
export { withAxiom as withLogger } from "next-axiom"
export type { Logger } from "next-axiom"

/**
 * Log requests in the middleware
 */
export function loggingMiddleware(request: NextRequest, event: NextFetchEvent) {
  const logger = new Logger({ source: "middleware" })
  logger.middleware(request)
  event.waitUntil(logger.flush())
}

/**
 * Create a logger for a server action
 *
 * @param metadata - The metadata of the action
 */
export function createActionLogger(metadata: ActionMetadata) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  const logger = new Logger({
    source: "action",
    req: { requestId, actionName: metadata.actionName },
  })
  const log = logger.with({})
  log.config.source = "action-log"

  return {
    log,
    flush: async (success: boolean) => {
      const endTime = Date.now()
      const headersList = await headers()
      const ip = await ipAddress({ headers: headersList })
      const geo = await geolocation({ headers: headersList })

      const report = {
        metadata,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        requestId,
        ip,
        ...geo,
      }

      logger.logHttpRequest(
        success ? LogLevel.info : LogLevel.error,
        `Action "${metadata.actionName}" ${success ? "succeeded" : "failed"} in ${report.durationMs}ms`,
        report,
        {}
      )

      logger.config.req = report

      waitUntil(log.flush())
    },
  }
}

/**
 * Create a logger for a route
 */
export function createRouteLogger(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const isEdge = !!globalThis.EdgeRuntime

  const logger = new Logger({
    source: isEdge ? "edge" : "lambda",
    req: {
      path: request.nextUrl.pathname,
      host: request.headers.get("host"),
      requestId,
    },
  })

  const log = logger.with({})
  log.config.source = isEdge ? "edge-log" : "lambda-log"

  return {
    log,
    flush: (logLevel: LogLevel, statusCode: StatusCodes) => {
      const endTime = Date.now()
      const report = {
        startTime,
        endTime,
        durationMs: endTime - startTime,
        path: request.nextUrl.pathname,
        method: request.method,
        host: request.headers.get("host"),
        userAgent: request.headers.get("user-agent"),
        scheme: request.nextUrl.protocol,
        requestId,
        ip: ipAddress(request),
        ...geolocation(request),
      }

      logger.logHttpRequest(
        logLevel,
        `[${request.method}] ${report.path} ${statusCode} ${report.durationMs}ms`,
        report,
        {}
      )

      logger.config.req = report
      log.attachResponseStatus(statusCode)

      waitUntil(log.flush())
    },
  }
}

type NextRequestWithLogger = NextRequest & {
  log: Logger
}
type HandlerWithLogger = (
  request: NextRequestWithLogger,
  args: { params?: Promise<Record<string, string>> }
) => Promise<Response> | Promise<NextResponse> | NextResponse | Response

/**
 * Add a logger to a route handler
 */
export function withRouteLogger(handler: HandlerWithLogger) {
  return async (
    request: NextRequest,
    args: { params?: Promise<Record<string, string>> }
  ) => {
    const logger = createRouteLogger(request)

    const modifiedRequest = request as NextRequestWithLogger
    modifiedRequest.log = logger.log

    try {
      const response = await handler(modifiedRequest, args)

      // Flush the logger (with child loggers)
      logger.flush(
        response.status >= 400 ? LogLevel.error : LogLevel.info,
        response.status
      )

      return response

      // Log if we reach an unhandled error
    } catch (error) {
      logger.flush(LogLevel.error, StatusCodes.INTERNAL_SERVER_ERROR)

      throw error
    }
  }
}

/**
 * Create a logger for a server component
 */
export function createComponentLogger(componentName: string) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  const logger = new Logger({
    source: "server-component",
    req: { requestId, componentName },
  })
  const log = logger.with({})
  log.config.source = "server-component-log"

  return {
    log,
    flush: async () => {
      const endTime = Date.now()
      const headersList = await headers()
      const ip = await ipAddress({ headers: headersList })
      const geo = await geolocation({ headers: headersList })

      const report = {
        componentName,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        requestId,
        ip,
        ...geo,
      }

      logger.logHttpRequest(
        LogLevel.info,
        `Server Component "${componentName}" rendered in ${report.durationMs}ms`,
        report,
        {}
      )

      logger.config.req = report

      waitUntil(log.flush())
    },
  }
}
