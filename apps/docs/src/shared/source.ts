import { loader } from "fumadocs-core/source"
import { i18n } from "~/shared/localization"
import { docs } from "~~/.source"

export const source = loader({
  baseUrl: "/",
  i18n,
  source: docs.toFumadocsSource(),
})
