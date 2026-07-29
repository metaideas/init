import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { Icon } from "@init/ui/components/icon"
import { m } from "#shared/internationalization/messages.js"
import { setLocale } from "#shared/internationalization/runtime.js"

export function LocaleToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
        <Icon.Languages className="size-4" />

        <span className="sr-only">{m.switch_locale()}</span>
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
