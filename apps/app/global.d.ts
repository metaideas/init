import type en from "./translations/en.json"
import type es from "./translations/es.json"

type Messages = typeof en & typeof es

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
