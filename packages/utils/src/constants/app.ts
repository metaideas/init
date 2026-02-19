export const APP_NAME = "Init"
export const APP_ID = "init"

export const THEMES = ["light", "dark", "system"] as const
export type Theme = (typeof THEMES)[number]
export const THEME_STORAGE_KEY = "init-theme"
export const I18N_COOKIE_NAME = "init-locale"
