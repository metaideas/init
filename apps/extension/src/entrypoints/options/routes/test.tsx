import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/test")({
  component: Test,
})

function Test() {
  return <div className="p-2">Hello from Test!</div>
}
