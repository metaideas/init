import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { ensureEnv } from "@tooling/env/vite"
import { defineConfig } from "astro/config"

void ensureEnv(process.env.NODE_ENV ?? "development")

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
      tailwindcss(),
      paraglide({
        outdir: "./src/shared/internationalization",
        project: "../../tooling/internationalization/project.inlang",
        strategy: ["url", "baseLocale"],
      }),
    ],
  },

  integrations: [react(), mdx()],
})
