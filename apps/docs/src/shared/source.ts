import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"

import { docs, meta } from "~~/.source"

import { i18n } from "~/shared/i18n"

export const source = loader({
  baseUrl: "/",
  i18n,
  source: createMDXSource(docs, meta),
})
