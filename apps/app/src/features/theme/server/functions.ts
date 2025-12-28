import { THEME_STORAGE_KEY } from "@init/utils/constants"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import { publicFunction } from "#shared/server/functions.ts"
import { ThemeSchema } from "../validation"

export const getTheme = publicFunction.handler(() => {
  const cookie = getCookie(THEME_STORAGE_KEY)
  const result = ThemeSchema.safeParse(cookie)

  if (!result.success) {
    return "system"
  }

  return result.data
})

export const setTheme = publicFunction.inputValidator(ThemeSchema).handler(({ data }) => {
  setCookie(THEME_STORAGE_KEY, data)
})
