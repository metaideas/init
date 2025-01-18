import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/popup")({
  component: Component,
})

function Component() {
  return <div className="h-[500px] w-[500px] bg-red-500">Popup works!</div>
}
