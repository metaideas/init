import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  // @ts-expect-error -- TODO: Find out why there's a type error here
  return {
    ...defaultMdxComponents,
    ...components,
  }
}
