import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

export const collections = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  blog: defineCollection({
    loader: glob({ base: "src/content/blog", pattern: "**/*.{md,mdx}" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    schema: z.object({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      date: z.date(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      description: z.string(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      title: z.string(),
    }),
  }),
}
