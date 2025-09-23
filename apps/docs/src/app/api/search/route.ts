import { locales } from "@init/internationalization/runtime"
import { createFromSource } from "fumadocs-core/search/server"
import { source } from "~/shared/source"

export const { GET } = createFromSource(source, {
  localeMap: {
    [locales[0]]: { language: "english" },
    [locales[1]]: { language: "spanish" },
  },
})
