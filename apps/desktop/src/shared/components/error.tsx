import type { ErrorComponentProps } from "@tanstack/react-router"
import { Button } from "@init/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@init/ui/components/empty"
import { useLogRenderError } from "#shared/hooks.ts"

export default function ErrorFallback({ error, reset }: ErrorComponentProps) {
  useLogRenderError(error)

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Empty className="max-w-lg border">
        <EmptyHeader>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            The page could not be loaded. Try again without restarting the desktop app.
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
