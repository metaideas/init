import { getTranslations } from "@init/internationalization/nextjs/server"
import { TypographyH1, TypographyP } from "@init/ui/components/typography"

import { LocaleToggle } from "~/shared/components/locale-toggle"

export default async function Page() {
  const t = await getTranslations("app")

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex flex-col">
        <TypographyH1>{t("test.title")}</TypographyH1>
        <TypographyP>{t("test.description")}</TypographyP>
        <TypographyP>{t("test.content")}</TypographyP>
      </div>
      <LocaleToggle />
    </div>
  )
}
