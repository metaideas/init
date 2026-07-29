import { Button } from "@init/ui/components/button"
import { Typography } from "@init/ui/components/typography"
import { useState } from "react"
import { Link } from "wouter"
import { m } from "#shared/internationalization/messages.js"
import {
  getLocale,
  type Locale,
  setLocale as setParaglideLocale,
} from "#shared/internationalization/runtime.js"

export default function PopupDemo() {
  const [locale, setLocale] = useState<Locale>(() => getLocale())

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale)
    void setParaglideLocale(nextLocale)
  }

  return (
    <div className="flex h-[420px] w-[420px] flex-col items-center justify-center gap-6 p-8">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <Typography.H1>{m.extension_title({}, { locale })}</Typography.H1>
        <Typography.P>{m.extension_description({}, { locale })}</Typography.P>
      </div>

      <fieldset className="flex gap-2">
        <legend className="sr-only">{m.switch_locale({}, { locale })}</legend>
        <Button
          aria-pressed={locale === "en"}
          onClick={() => {
            selectLocale("en")
          }}
          variant={locale === "en" ? "default" : "outline"}
        >
          {m.english({}, { locale })}
        </Button>
        <Button
          aria-pressed={locale === "es"}
          onClick={() => {
            selectLocale("es")
          }}
          variant={locale === "es" ? "default" : "outline"}
        >
          {m.spanish({}, { locale })}
        </Button>
      </fieldset>

      <Button render={<Link to="/settings" />}>Go to settings</Button>
    </div>
  )
}
