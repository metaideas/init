import { getTestService } from "@/lib/services"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@this/ui/components/button"

const testService = getTestService()

export const Route = createFileRoute("/popup")({
  component: Component,
})

function Component() {
  return (
    <div className="h-[500px] w-[500px] bg-red-500">
      <h1>Popup works!</h1>
      <Button
        onClick={() => {
          testService.test()
        }}
      >
        Testing this
      </Button>
    </div>
  )
}
