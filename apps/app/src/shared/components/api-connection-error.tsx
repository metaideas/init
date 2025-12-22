import { Button } from "@init/ui/components/button"
import { Icon } from "@init/ui/components/icon"
import type { ErrorComponentProps } from "@tanstack/react-router"
import env from "#shared/env.ts"

function isConnectionError(error: Error): boolean {
  const message = error.message.toLowerCase()

  return (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("econnrefused") ||
    message.includes("connection refused") ||
    error.name === "TypeError"
  )
}

export default function ApiConnectionError({ error, reset }: ErrorComponentProps) {
  const isApiError = isConnectionError(error)

  if (!isApiError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-pulse bg-destructive/20 blur-3xl" />
              <Icon.TriangleAlert className="relative size-24 text-destructive" />
            </div>
          </div>

          <div className="mb-8 space-y-3">
            <h2 className="font-semibold text-2xl tracking-tight sm:text-3xl">
              Something went wrong
            </h2>
            <p className="mx-auto max-w-md text-lg text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {error.message && (
              <pre className="mx-auto mt-4 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-muted-foreground text-sm">
                {error.message}
              </pre>
            )}
          </div>

          <Button onClick={reset} size="lg" variant="default">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const apiUrl = env.PUBLIC_API_URL

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-pulse bg-destructive/20 blur-3xl" />
            <Icon.OctagonX className="relative size-24 text-destructive" />
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <h2 className="font-semibold text-2xl tracking-tight sm:text-3xl">
            Unable to connect to API
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            The application requires the API server to be running.
          </p>
        </div>

        <div className="mb-8 rounded-lg border bg-muted/50 p-6 text-left">
          <h3 className="mb-4 font-medium text-lg">To fix this issue:</h3>
          <ol className="list-inside list-decimal space-y-3 text-muted-foreground">
            <li>
              Make sure the API server is running
              <pre className="mt-2 rounded bg-background p-3 font-mono text-foreground text-sm">
                bun dev --filter=api
              </pre>
            </li>
            {apiUrl && (
              <li>
                Verify the API is accessible at{" "}
                <code className="rounded bg-background px-2 py-1 font-mono text-sm">{apiUrl}</code>
              </li>
            )}
            <li>Check that there are no network issues or firewall blocking the connection</li>
          </ol>
        </div>

        <Button onClick={reset} size="lg" variant="default">
          <Icon.Loader className="mr-2 size-4" />
          Retry Connection
        </Button>
      </div>
    </div>
  )
}
