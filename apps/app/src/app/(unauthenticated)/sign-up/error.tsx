"use client"

import { useReportError } from "@init/observability/error/nextjs/client"

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
