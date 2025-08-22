// biome-ignore syntax/correctness/noTypeOnlyImportAttributes: This is a type only import
import type en from "../../translations/en.json" with { type: "json" }
import type { Locale } from "../locale"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof en
  }
}
