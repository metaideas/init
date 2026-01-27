import { Button } from "@init/ui/components/button"
import { Typography } from "@init/ui/components/typography"
import { Link } from "wouter"

export default function PopupDemo() {
  return (
    <div className="flex h-[500px] w-[500px] flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center">
        <Typography.H1>Hello!</Typography.H1>
        <Typography.P>
          This is a demo of the popup. It is a simple popup that displays a message.
        </Typography.P>
      </div>

      <Button>Click me</Button>

      <Button render={<Link to="/settings" />}>Go to settings</Button>
    </div>
  )
}
