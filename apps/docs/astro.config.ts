import starlight from "@astrojs/starlight"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/shared/styles/globals.css"],
      defaultLocale: "root",
      locales: {
        es: {
          label: "Español",
          lang: "es",
        },
        root: {
          label: "English",
          lang: "en",
        },
      },
      sidebar: [
        {
          items: [
            {
              label: "Overview",
              slug: "",
              translations: {
                es: "Descripción general",
              },
            },
          ],
          label: "Init",
          translations: {
            es: "Init",
          },
        },
      ],
      social: [
        {
          href: "https://github.com/metaideas/init",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "Init Docs",
    }),
  ],
  server: {
    port: Number(process.env.PORT ?? 3004),
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
})
