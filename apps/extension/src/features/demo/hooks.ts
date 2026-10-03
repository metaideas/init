import { useState } from "react"
import {
  getLocale,
  type Locale,
  setLocale as setParaglideLocale,
} from "#shared/internationalization/runtime.js"

export function useLocaleSelection() {
  const [locale, setLocale] = useState<Locale>(() => getLocale())

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale)
    void setParaglideLocale(nextLocale)
  }

  return { locale, selectLocale }
}
