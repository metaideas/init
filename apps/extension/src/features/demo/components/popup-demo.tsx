import { Button } from "@init/ui/components/button"
import { TypographyH1, TypographyP } from "@init/ui/components/typography"
import { Link } from "react-router"
import { getTestService } from "~/shared/services"

const testService = getTestService()

export default function PopupDemo() {
  return (
    <div className="flex h-[500px] w-[500px] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center">
        <TypographyH1>Hello!</TypographyH1>
        <TypographyP>
          This is a demo of the popup. It is a simple popup that displays a
          message.
        </TypographyP>
      </div>

      <Button onClick={() => testService.test()}>Log a message</Button>

      <Button asChild>
        <Link to="/settings">Go to settings</Link>
      </Button>
    </div>
  )
}
