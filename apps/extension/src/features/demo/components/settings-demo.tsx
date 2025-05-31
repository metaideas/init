import { Link } from "react-router"

import { Button } from "@init/ui/components/button"
import { TypographyH1, TypographyP } from "@init/ui/components/typography"

export default function SettingsDemo() {
  return (
    <div className="flex h-[500px] w-[500px] flex-col items-center justify-center gap-4">
      <TypographyH1>Settings</TypographyH1>
      <TypographyP>
        This is a demo of the settings. It is a simple settings that displays a
        message.
      </TypographyP>
      <Button asChild>
        <Link to="/">Go back to home</Link>
      </Button>
    </div>
  )
}
