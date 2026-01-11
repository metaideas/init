import { m } from "@init/internationalization/messages"
import { setLocale } from "@init/internationalization/runtime"
import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { Icon } from "@init/ui/components/icon"

export function LocaleToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
        <Icon.Languages className="size-4" />

        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            void setLocale("es")
          }}
        >
          🇪🇸{" "}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
          {m.spanish()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            void setLocale("en")
          }}
        >
          🇺🇸{" "}
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
          {m.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
