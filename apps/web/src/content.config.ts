import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    slug: z.string(),
    description: z.string(),
  }),
})

export const collections = { blog }
