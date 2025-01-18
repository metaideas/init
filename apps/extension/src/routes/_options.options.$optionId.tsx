import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_options/options/$optionId")({
  component: Component,
})

function Component() {
  const { optionId } = Route.useParams()

  return <div>Hello Options {optionId}!</div>
}
