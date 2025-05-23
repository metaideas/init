import type { Locale } from "@init/utils/constants"

import type en from "../../translations/en.json"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof en
  }
}
