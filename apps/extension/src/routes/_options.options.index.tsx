import { Link, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_options/options/")({
  component: Component,
})

function Component() {
  return (
    <>
      <h1>Options</h1>
      <Link to="/options/$optionId" params={{ optionId: "1" }}>
        Options 1
      </Link>
      <Link to="/options/$optionId" params={{ optionId: "2" }}>
        Options 2
      </Link>
    </>
  )
}
