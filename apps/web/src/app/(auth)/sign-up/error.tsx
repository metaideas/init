"use client"

import { useReportError } from "~/lib/hooks/use-report-error"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useReportError(error)

  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </div>
  )
}
