import { internationalization } from "@init/internationalization/plugin"
import { cookieName } from "@init/internationalization/runtime"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  envPrefix: ["PUBLIC_"],
  plugins: [
    tailwindcss(),
    tanstackStart(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    internationalization({
      cookieName,
      outdir: "../../packages/internationalization/src/_generated",
      project: "../../packages/internationalization/project.inlang",
      strategy: ["cookie", "baseLocale"],
    }),
    nitro({
      preset: "bun",
    }),
  ],
  server: {
    port: 3001,
  },
})
