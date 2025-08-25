import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config"

export const docs = defineDocs({
  dir: "content",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    // MDX options
  },
})
