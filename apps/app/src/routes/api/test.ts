import { createFileRoute } from "@tanstack/react-router"
import { requireSession } from "#shared/server/middleware.ts"

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          message: 'Hello "/api/test"!',
        }),
    },
    middleware: [requireSession],
  },
})
