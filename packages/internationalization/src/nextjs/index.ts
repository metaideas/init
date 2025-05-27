import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

import { DEFAULT_LOCALE, LOCALES } from "../locale"

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
})

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing)

export * from "next-intl"
