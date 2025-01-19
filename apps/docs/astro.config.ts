import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

import tailwind from "@astrojs/tailwind"

export default defineConfig({
  integrations: [
    starlight({
      title: "Init Docs",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/assets/styles/tailwind.css"],
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
})
