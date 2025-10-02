import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import { internationalization } from "@init/internationalization/plugin"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  server: {
    port: 3006,
  },

  i18n: {
    defaultLocale: "en",
    locales: ["es", "en"],
  },

  vite: {
    plugins: [
      // @ts-expect-error - conflict due to multiple Vite versions
      tailwindcss(),
      // @ts-expect-error - conflict due to multiple Vite versions
      internationalization({
        project: "../../packages/internationalization/project.inlang",
        outdir: "../../packages/internationalization/src/_generated",
        strategy: ["url", "baseLocale"],
      }),
    ],
  },

  integrations: [react(), mdx()],
})
