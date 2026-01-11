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
            void setLocale("es")
          }}
        >
          🇪🇸 {m.spanish()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void setLocale("en")
          }}
        >
          🇺🇸 {m.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
