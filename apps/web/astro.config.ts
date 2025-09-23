import mdx from "@astrojs/mdx"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

export default defineConfig({
  server: {
    port: 3006,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), mdx()],
})
