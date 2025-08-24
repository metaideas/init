import { getLocale } from "@init/internationalization/nextjs/server"
import { createFromSource } from "fumadocs-core/search/server"
import { source } from "~/shared/source"

export const { GET } = createFromSource(source, {
  language: await getLocale(),
})
