import { useEffect } from "react"

import { reportError } from "#sentry/index.ts"

export function useReportError(error: unknown) {
  useEffect(() => {
    reportError(error)
  }, [error])
}
