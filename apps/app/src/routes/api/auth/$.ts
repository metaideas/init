import { createFileRoute } from "@tanstack/react-router"
import { withAuth } from "#shared/server/middleware.ts"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ context, request }) => context.auth.handler(request),
      POST: ({ context, request }) => context.auth.handler(request),
    },
    middleware: [withAuth],
  },
})
