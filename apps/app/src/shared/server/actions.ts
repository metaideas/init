"use server"

import { LOCALE_COOKIE_NAME, LOCALES } from "@init/internationalization/locale"
import * as z from "@init/utils/schema"
import { cookies } from "next/headers"
import { publicAction } from "~/shared/action-client"

export const changeLocale = publicAction
  .metadata({ name: "changeLocale" })
  .inputSchema(z.object({ locale: z.enum(LOCALES) }))
  .action(async ({ parsedInput: { locale } }) => {
    const cookieStore = await cookies()

    cookieStore.set(LOCALE_COOKIE_NAME, locale)
  })
