"use client"

import { reportError } from "@this/observability/instrumentation/error"
import { LogLevel, useLogger } from "next-axiom"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function useReportError(error: Error) {
  const logger = useLogger()
  const pathname = usePathname()

  useEffect(() => {
    reportError(error, logger)

    logger.logHttpRequest(
      LogLevel.error,
      error.message,
      {
        host: window.location.href,
        path: pathname,
        statusCode: status,
      },
      {
        error: error.name,
        cause: error.cause,
        stack: error.stack,
      }
    )
  }, [error, logger, pathname])
}
