import { THEME_STORAGE_KEY } from "@init/utils/constants"
import { z } from "@init/utils/schema"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import {
  requireAdmin,
  requireSession,
  withDatabase,
  withLogger,
} from "#shared/server/middleware.ts"

export const publicFunction = createServerFn().middleware([
  withDatabase,
  withLogger,
])
export const protectedFunction = publicFunction.middleware([requireSession])
export const adminFunction = protectedFunction.middleware([requireAdmin])

const VALID_COOKIES = [THEME_STORAGE_KEY] as const

export const setServerCookie = publicFunction({ method: "POST" })
  .inputValidator(z.object({ key: z.enum(VALID_COOKIES), value: z.string() }))
  .handler(({ data: { key, value } }) => {
    setCookie(key, value)
  })

export const getServerCookies = publicFunction({ method: "GET" }).handler(
  () => new Map(VALID_COOKIES.map((key) => [key, getCookie(key)]))
)
