import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page"
import { notFound } from "next/navigation"
import { getMDXComponents } from "~/shared/mdx-components"
import { source } from "~/shared/source"

export default async function Page(props: {
  params: Promise<{ slug?: string[]; lang: string }>
}) {
  const { slug, lang } = await props.params
  const page = source.getPage(slug, lang)

  if (!page) {
    notFound()
  }

  const MDX = page.data.body

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <p>{page.data.content}</p>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[]; lang: string }>
}) {
  const { slug, lang } = await params
  const page = source.getPage(slug, lang)

  if (!page) {
    notFound()
  }

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
