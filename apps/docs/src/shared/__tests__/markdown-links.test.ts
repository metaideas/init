import { describe, expect, test } from "bun:test"

import { rewriteDocsHref } from "#shared/markdown-links.ts"

describe("rewriteDocsHref", () => {
  test("converts Markdown files to generated routes", () => {
    expect(rewriteDocsHref("./generators.md")).toBe("/generators/")
    expect(rewriteDocsHref("./architecture/project-structure.md")).toBe(
      "/architecture/project-structure/"
    )
  })

  test("preserves heading fragments", () => {
    expect(rewriteDocsHref("./template-commands.md#updating-your-project")).toBe(
      "/template-commands/#updating-your-project"
    )
  })

  test("resolves links from nested source documents", () => {
    expect(rewriteDocsHref("../packages.md", "architecture/project-structure.md")).toBe(
      "/packages/"
    )
  })

  test("maps index documents to their directory", () => {
    expect(rewriteDocsHref("../index.mdx", "es/index.mdx")).toBe("/")
  })

  test("leaves external and non-document links unchanged", () => {
    expect(rewriteDocsHref("https://example.com/guide.md")).toBe("https://example.com/guide.md")
    expect(rewriteDocsHref("#setup")).toBe("#setup")
    expect(rewriteDocsHref("./diagram.svg")).toBe("./diagram.svg")
  })
})
