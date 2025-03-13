import createNextIntlPlugin from "next-intl/plugin"

import { LOCALES } from "../locale"

const messages = LOCALES.map(locale => `./translations/${locale}.json`)

export const withIntl = createNextIntlPlugin({
  requestConfig: "./src/shared/i18n.ts",
  experimental: {
    createMessagesDeclaration: messages,
  },
})
