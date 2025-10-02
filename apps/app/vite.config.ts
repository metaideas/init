import path from "node:path"
import { internationalization } from "@init/internationalization/plugin"
import { cookieName } from "@init/internationalization/runtime"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    react(),
    // @ts-expect-error - conflict due to multiple Vite versions
    internationalization({
      cookieName,
      project: "../../packages/internationalization/project.inlang",
      outdir: "../../packages/internationalization/src/_generated",
      strategy: ["cookie", "baseLocale"],
    }),
  ],
  envPrefix: ["PUBLIC_"],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~~": path.resolve(__dirname, "."),
    },
  },
})
