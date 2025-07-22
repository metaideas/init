import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"
import { i18n } from "~/shared/localization"
import { docs, meta } from "~~/.source"

export const source = loader({
  baseUrl: "/",
  i18n,
  source: createMDXSource(docs, meta),
})
