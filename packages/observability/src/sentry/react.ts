import { useEffect } from "react"

import { useLogger } from "next-axiom"
import { reportError } from "#sentry/index.ts"

export function useReportError(error: unknown) {
  const logger = useLogger()

  useEffect(() => {
    reportError(error, logger)
  }, [error, logger])
}
