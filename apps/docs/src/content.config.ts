import { docsSchema } from "@astrojs/starlight/schema"
import { glob } from "astro/loaders"
import { defineCollection } from "astro:content"

export const collections = {
  docs: defineCollection({
    loader: glob({
      base: "../../docs",
      pattern: ["*.{md,mdx}", "architecture/**/*.{md,mdx}", "es/**/*.{md,mdx}"],
    }),
    schema: docsSchema(),
  }),
}
