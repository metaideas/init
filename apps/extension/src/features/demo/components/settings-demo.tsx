import { Button } from "@init/ui/components/button"
import { Typography } from "@init/ui/components/typography"
import { Link } from "wouter"

export default function SettingsDemo() {
  return (
    <div className="flex h-[500px] w-[500px] flex-col items-center justify-center gap-4">
      <Typography.H1>Settings</Typography.H1>
      <Typography.P>
        This is a demo of the settings. It is a simple settings that displays a message.
      </Typography.P>
      <Button render={<Link to="/" />}>Go back to home</Button>
    </div>
  )
}
