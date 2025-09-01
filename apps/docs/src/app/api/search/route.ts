import { Locales } from "@init/internationalization/locale"
import { createFromSource } from "fumadocs-core/search/server"
import { source } from "~/shared/source"

export const { GET } = createFromSource(source, {
  localeMap: {
    [Locales.EN]: { language: "english" },
    [Locales.ES]: { language: "spanish" },
  },
})
