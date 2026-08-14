import type { ErrorComponentProps } from "@tanstack/react-router"
import { Button } from "@init/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@init/ui/components/empty"
import { useEffect } from "react"
import { logger } from "#shared/logger.ts"

export default function ErrorFallback({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    logger.error({ error, message: "Route rendering failed" })
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Empty className="max-w-lg border">
        <EmptyHeader>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            The page could not be loaded. Try again, or reload the app if the problem continues.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={() => {
              reset()
            }}
          >
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
