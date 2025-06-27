// biome-ignore lint/nursery/useJsonImportAttribute: This is a type only import
import type en from "../../translations/en.json"
import type { Locale } from "../locale"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof en
  }
}
