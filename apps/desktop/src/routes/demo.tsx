import { createFileRoute, Link } from "@tanstack/react-router"
import InvokeDemo from "#features/demo/components/invoke-demo.tsx"

export const Route = createFileRoute("/demo")({
  component: Component,
})

function Component() {
  return (
    <div className="p-2">
      <h3>Hello from the demo!</h3>

      <InvokeDemo />
      <Link to="/">Home</Link>
    </div>
  )
}
