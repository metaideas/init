import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@init/ui/components/button"
import { TypographyH1 } from "@init/ui/components/typography"
import { getTestService } from "~/shared/services"

const testService = getTestService()

export const Route = createFileRoute("/popup/_layout/")({
  component: Component,
})

function Component() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <TypographyH1>This is the popup entrypoint</TypographyH1>
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
