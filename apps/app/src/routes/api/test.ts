import { createFileRoute } from "@tanstack/react-router"
import { json } from "@tanstack/react-start"
import { requireSession } from "~/shared/server/middleware"

export const Route = createFileRoute("/api/test")({
  server: {
    middleware: [requireSession],
    handlers: {
      GET: () => {
        return json({
          message: 'Hello "/api/test"!',
        })
      },
    },
  },
})
