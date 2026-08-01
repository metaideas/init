import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { ensureEnv } from "@tooling/env/vite"
import { defineConfig } from "astro/config"

await ensureEnv(process.env.NODE_ENV ?? "development", import.meta.dirname)
const { default: env } = await import("./src/shared/env.ts")

export default defineConfig({
  output: "static",
  server: {
    port: Number(process.env.PORT ?? 3006),
  },
  site: env.PUBLIC_SITE_URL ?? "https://init.now",

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
    react(),
    mdx(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
    }),
  ],
})
