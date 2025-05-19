"use server"

import { cookies } from "next/headers"

import { LOCALES, LOCALE_COOKIE_NAME } from "@init/internationalization/locale"
import * as z from "@init/utils/schema"

import { publicAction } from "~/shared/action-client"

export const changeLocale = publicAction
  .metadata({ name: "changeLocale" })
  .schema(z.object({ locale: z.enum(LOCALES) }))
  .action(async ({ parsedInput: { locale } }) => {
    const cookieStore = await cookies()

    cookieStore.set(LOCALE_COOKIE_NAME, locale)
  })
