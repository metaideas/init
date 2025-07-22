import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { baseOptions } from "~/app/layout.config"
import { source } from "~/shared/source"

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!source.pageTree[lang]) {
    notFound()
  }

  return (
    <DocsLayout tree={source.pageTree[lang]} {...baseOptions}>
      {children}
    </DocsLayout>
  )
}
