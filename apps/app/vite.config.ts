import { I18N_COOKIE_NAME } from "@init/utils/constants"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { ensureEnv } from "@tooling/env/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

// @ts-expect-error Bun resolves duplicate vite copies in its virtual store, causing plugin type mismatches
export default defineConfig(({ mode }) => {
  void ensureEnv(mode)

  return {
    envPrefix: ["PUBLIC_"],
    plugins: [
      tailwindcss(),
      tanstackStart(),
      devtools(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", {}]],
        },
      }),
      paraglide({
        cookieName: I18N_COOKIE_NAME,
        outdir: "./src/shared/internationalization",
        project: "../../tooling/internationalization/project.inlang",
        strategy: ["cookie", "baseLocale"],
      }),
      nitro({
        preset: "bun",
      }),
    ],
    server: {
      port: 3001,
    },
  }
})
