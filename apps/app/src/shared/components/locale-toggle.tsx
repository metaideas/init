"use client"

import { m } from "@init/internationalization/messages"
import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { LanguagesIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { changeLocale } from "~/shared/server/actions"

export function LocaleToggle() {
  const { execute } = useAction(changeLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <LanguagesIcon className="size-4" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => execute({ locale: "es" })}>
          🇪🇸 {m.spanish()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => execute({ locale: "en" })}>
          🇺🇸 {m.english()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
