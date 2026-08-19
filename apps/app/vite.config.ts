import { observability } from "@init/observability/logger/vite"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { I18N_COOKIE_NAME } from "@tooling/internationalization"
import { varlockVitePlugin as varlock } from "@varlock/vite-integration"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import { ENV } from "#shared/env.generated.ts"

export default defineConfig({
  optimizeDeps: {
    exclude: ["bun"],
  },
  plugins: [
    devtools(),
    varlock(),
    observability({ service: "app" }),
    tailwindcss(),
    tanstackStart(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
    port: ENV.PORT,
  },
})
