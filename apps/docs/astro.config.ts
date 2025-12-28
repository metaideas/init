import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/shared/styles/global.css"],
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
            // Each item here is one entry in the navigation menu.
            {
              label: "Example Guide",
              slug: "guides/example",
              translations: {
                es: "Guía de Ejemplo",
              },
            },
          ],
          label: "Guides",
          translations: {
            es: "Guías",
          },
        },
        {
          autogenerate: { directory: "reference" },
          label: "Reference",
          translations: {
            es: "Referencia",
          },
        },
      ],
      social: [
        {
          href: "https://github.com/withastro/starlight",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "Init Docs",
    }),
    react(),
  ],
  server: {
    port: 3004,
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
