import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/new")({
  component: New,
})

function New() {
  return <div className="p-2">Hello from New!</div>
}
