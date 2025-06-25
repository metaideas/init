import type en from "../../translations/en.json"
import type { Locale } from "../locale"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof en
  }
}
