import { createI18nMiddleware } from "fumadocs-core/i18n"

import { i18n } from "~/shared/i18n"

export const i18nMiddleware = createI18nMiddleware(i18n)
