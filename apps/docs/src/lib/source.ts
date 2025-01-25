import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"
import { i18n } from "~/lib/i18n"
import { docs, meta } from "~~/.source"

export const source = loader({
  baseUrl: "/",
  source: createMDXSource(docs, meta),
  i18n,
})
