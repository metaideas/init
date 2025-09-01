import { createI18nMiddleware } from "fumadocs-core/i18n/middleware"
import { i18n } from "~/shared/localization"

export const i18nMiddleware = createI18nMiddleware(i18n)
