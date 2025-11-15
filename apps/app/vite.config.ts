import { internationalization } from "@init/internationalization/plugin"
import { cookieName } from "@init/internationalization/runtime"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    react(),
    internationalization({
      cookieName,
      project: "../../packages/internationalization/project.inlang",
      outdir: "../../packages/internationalization/src/_generated",
      strategy: ["cookie", "baseLocale"],
    }),
    nitro({
      preset: "bun",
    }),
  ],
  envPrefix: ["PUBLIC_"],
})
