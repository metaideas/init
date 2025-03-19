"use server"

import { cookies } from "next/headers"

import { LOCALES, LOCALE_COOKIE_NAME } from "@init/internationalization/locale"
import { z } from "@init/utils/schema"

import { actionClient } from "~/shared/safe-action"

export const changeLocale = actionClient
  .metadata({ name: "changeLocale" })
  .schema(z.object({ locale: z.enum(LOCALES) }))
  .action(async ({ parsedInput: { locale } }) => {
    const cookieStore = await cookies()

    cookieStore.set(LOCALE_COOKIE_NAME, locale)
  })
