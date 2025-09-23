"use server"

import { cookieName, locales } from "@init/internationalization/runtime"
import * as z from "@init/utils/schema"
import { cookies } from "next/headers"
import { publicAction } from "~/shared/action-client"

export const changeLocale = publicAction
  .metadata({ name: "changeLocale" })
  .inputSchema(z.object({ locale: z.enum(locales) }))
  .action(async ({ parsedInput: { locale } }) => {
    const cookieStore = await cookies()

    cookieStore.set(cookieName, locale)
  })
