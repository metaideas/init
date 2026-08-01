import { posix, relative, resolve } from "node:path"

type MarkdownNode = {
  children?: MarkdownNode[]
  type?: string
  url?: string
}

type MarkdownFile = {
  path?: string
}

const docsRoot = resolve(import.meta.dirname, "../../../../docs")

export function rewriteDocsHref(href: string, sourceDocument = "index.mdx") {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("//")) return href

  const [path, fragment] = href.split("#", 2)

  if (!path || !/\.mdx?$/i.test(path)) return href

  const sourceDirectory = posix.dirname(`/${sourceDocument}`)
  const documentPath = posix.normalize(posix.join(sourceDirectory, path))
  const route = documentPath.replace(/(?:^|\/)index\.mdx?$/i, "/").replace(/\.mdx?$/i, "/")
  return fragment ? `${route}#${fragment}` : route
}

export default function rewriteDocsLinks() {
  return function transform(tree: MarkdownNode, file: MarkdownFile) {
    const sourceDocument = file.path
      ? relative(docsRoot, file.path).replaceAll("\\", "/")
      : "index.mdx"
    visit(tree, sourceDocument)
  }
}

function visit(node: MarkdownNode, sourceDocument: string) {
  const transformedNode = node
  if (transformedNode.type === "link" && transformedNode.url)
    transformedNode.url = rewriteDocsHref(transformedNode.url, sourceDocument)
  transformedNode.children?.forEach((child) => {
    visit(child, sourceDocument)
  })
}
