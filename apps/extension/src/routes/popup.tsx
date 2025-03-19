import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@init/ui/button"
import { TypographyH1 } from "@init/ui/typography"

import { getTestService } from "~/shared/services"

const testService = getTestService()

export const Route = createFileRoute("/popup")({
  component: Component,
})

function Component() {
  return (
    <div className=" h-[500px] w-[500px]">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <TypographyH1>Popup works!</TypographyH1>
        <Button
          onClick={() => {
            testService.test()
          }}
        >
          Testing this
        </Button>
      </div>
    </div>
  )
}
