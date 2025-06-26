import path from "node:path"
import createNextIntlPlugin from "next-intl/plugin"
import { LOCALES } from "../locale"

// We're using the relative path to the translation files since we follow the
// same structure in each project that uses this package.

const messages = LOCALES.map((locale) =>
  path.resolve(__dirname, `../../translations/${locale}.json`)
)

export const withIntl = createNextIntlPlugin({
  requestConfig: "./src/shared/localization.ts",
  experimental: {
    createMessagesDeclaration: messages,
  },
})
