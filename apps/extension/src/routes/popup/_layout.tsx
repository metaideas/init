import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/popup/_layout")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className=" h-[500px] w-[500px]">
      <Outlet />
    </div>
  )
}
