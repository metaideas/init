import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import varlock from "@varlock/astro-integration"
import { defineConfig } from "astro/config"
import { ENV } from "./src/shared/env.generated.ts"

export default defineConfig({
  output: "static",
  server: {
    port: ENV.PORT,
  },
  site: ENV.PUBLIC_SITE_URL ?? "https://init.now",

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
        strategy: ["url", "globalVariable", "baseLocale"],
      }),
    ],
  },

  integrations: [
    varlock(),
    react(),
    mdx(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
    }),
  ],
})
