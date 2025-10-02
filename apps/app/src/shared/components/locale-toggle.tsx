import { m } from "@init/internationalization/messages"
import { setLocale } from "@init/internationalization/runtime"
import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { LanguagesIcon } from "lucide-react"

export function LocaleToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <LanguagesIcon className="size-4" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("es")}>
          🇪🇸 {m.spanish()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")}>
          🇺🇸 {m.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
