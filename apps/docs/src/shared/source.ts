import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"

import { docs, meta } from "~~/.source"

import { i18n } from "~/shared/localization"

export const source = loader({
  baseUrl: "/",
  i18n,
  source: createMDXSource(docs, meta),
})
