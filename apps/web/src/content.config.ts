import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

export const collections = {
  blog: defineCollection({
    loader: glob({ base: "src/content/blog", pattern: "**/*.{md,mdx}" }),
    schema: z.object({
      date: z.date(),
      description: z.string(),
      title: z.string(),
    }),
  }),
}
