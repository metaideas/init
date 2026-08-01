import { seconds } from "qte"

export const AUTH_COOKIE_PREFIX = "init"
export const AUTH_APP_NAME = "init"

export const AUTH_ADVANCED_OPTIONS = {
  cookiePrefix: AUTH_COOKIE_PREFIX,
  database: { generateId: false },
} as const

export const AUTH_EMAIL_AND_PASSWORD_OPTIONS = {
  autoSignIn: true,
  enabled: true,
} as const

export const AUTH_SESSION_OPTIONS = {
  expiresIn: seconds("30d"),
  updateAge: seconds("15d"),
} as const
