import { THEME_COOKIE_NAME } from "@init/utils/constants"
import { z } from "@init/utils/schema"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import {
  requireAdmin,
  requireSession,
  withDatabase,
  withLogger,
} from "~/shared/server/middleware"

export const publicFunction = createServerFn().middleware([
  withDatabase,
  withLogger,
])
export const protectedFunction = publicFunction.middleware([requireSession])
export const adminFunction = protectedFunction.middleware([requireAdmin])

const VALID_COOKIES = [THEME_COOKIE_NAME] as const

export const setServerCookie = publicFunction({ method: "POST" })
  .inputValidator(z.object({ key: z.enum(VALID_COOKIES), value: z.string() }))
  .handler(({ data: { key, value } }) => {
    setCookie(key, value)
  })

export const getServerCookies = publicFunction({ method: "GET" }).handler(() =>
  VALID_COOKIES.reduce(
    (acc, key) => {
      acc[key] = getCookie(key)
      return acc
    },
    {} as Record<string, string | undefined>
  )
)
