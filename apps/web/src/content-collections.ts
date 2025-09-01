import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
// We're importing the zod package directly for the prebuild script
import { z } from "zod"

const posts = defineCollection({
  directory: "../content/posts",
  include: ["**/*.md", "**/*.mdx"],
  name: "posts",
  schema: z.object({
    summary: z.string(),
    title: z.string(),
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
