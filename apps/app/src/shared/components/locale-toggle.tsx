"use client"

import { LanguagesIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"

import { useTranslations } from "@init/internationalization/nextjs"
import { Button } from "@init/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/dropdown-menu"

import { changeLocale } from "~/shared/server/actions"

export function LocaleToggle() {
  const t = useTranslations("web.home.locale")
  const { execute } = useAction(changeLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <LanguagesIcon className="size-4" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => execute({ locale: "es" })}>
          🇪🇸 {t("es")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => execute({ locale: "en" })}>
          🇺🇸 {t("en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
