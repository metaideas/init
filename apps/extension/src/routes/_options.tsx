import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_options")({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div className="h-[500px] w-[500px] bg-blue-500">
      <div>This is the root options layout</div>
      <Outlet />
    </div>
  )
}
