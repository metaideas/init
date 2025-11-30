import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  server: {
    port: 3004,
  },
  integrations: [
    starlight({
      title: "Init Docs",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        es: {
          label: "Español",
          lang: "es",
        },
      },
      sidebar: [
        {
          label: "Guides",
          translations: {
            es: "Guías",
          },
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Example Guide",
              slug: "guides/example",
              translations: {
                es: "Guía de Ejemplo",
              },
            },
          ],
        },
        {
          label: "Reference",
          translations: {
            es: "Referencia",
          },
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/shared/styles/global.css"],
    }),
    react({
      experimentalReactCompiler: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
