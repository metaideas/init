import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: ["**/*.md", "**/*.mdx"],
  schema: z => ({
    title: z.string(),
    summary: z.string(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document)

    return {
      ...document,
      body,
    }
  },
})

export default defineConfig({
  collections: [posts],
})
