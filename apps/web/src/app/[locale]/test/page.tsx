import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t("test.title")}</h1>
      <h2>{t("test.description")}</h2>
      <p>{t("test.content")}</p>
    </div>
  )
}
