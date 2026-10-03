import { createFileRoute } from "@tanstack/react-router"
import Showcase from "#features/showcase/components/showcase.tsx"

export const Route = createFileRoute("/showcase")({
  component: Showcase,
  head: () => ({
    meta: [{ title: "Showcase" }],
  }),
})
