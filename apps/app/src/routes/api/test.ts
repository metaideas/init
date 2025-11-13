import { createFileRoute } from "@tanstack/react-router"
import { json } from "@tanstack/react-start"
import { requireSession } from "#shared/server/middleware.ts"

export const Route = createFileRoute("/api/test")({
  server: {
    middleware: [requireSession],
    handlers: {
      GET: () =>
        json({
          message: 'Hello "/api/test"!',
        }),
    },
  },
})
