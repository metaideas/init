export const APP_NAME = "Init"
export const APP_ID = "init"

export const REACT_PUBLIC_ENV_PREFIX = "PUBLIC_"
export const EXPO_PUBLIC_ENV_PREFIX = "EXPO_PUBLIC_"

export const THEMES = ["light", "dark", "system"] as const
export type Theme = (typeof THEMES)[number]
export const THEME_STORAGE_KEY = "init-theme"
export const I18N_COOKIE_NAME = "init-locale"
