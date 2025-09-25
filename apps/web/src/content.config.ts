import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

export const collections = {
  blog: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/blog" }),
    schema: z.object({
      title: z.string(),
      date: z.date(),
      description: z.string(),
    }),
  }),
}
