import { getTranslations } from "@this/i18n/nextjs/server"

export default async function Page() {
  const t = await getTranslations()

  return (
    <div>
      <h1>{t("test.title")}</h1>
      <h2>{t("test.description")}</h2>
      <p>{t("test.content")}</p>
    </div>
  )
}
