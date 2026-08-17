import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import { observability } from "@init/observability/logger/vite"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { varlockVitePlugin as varlock } from "@varlock/vite-integration"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { ENV } from "#shared/env.generated.ts"

export default defineConfig(() => {
  const host = ENV.TAURI_DEV_HOST
  const isDebug = ENV.TAURI_ENV_DEBUG

  return {
    build: {
      minify: isDebug ? false : ("oxc" as const),
      sourcemap: isDebug,
      target: ENV.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    },
    clearScreen: false,
    plugins: [
      devtools(),
      varlock(),
      observability({ service: "desktop" }),
      tailwindcss(),
      paraglide({
        outdir: "./src/shared/internationalization",
        project: "../../tooling/internationalization/project.inlang",
        strategy: ["localStorage", "baseLocale"],
      }),
      tanstackRouter({
        autoCodeSplitting: false,
        target: "react",
      }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      hmr: host
        ? {
            host,
            protocol: "ws",
          }
        : undefined,
      host: host ?? false,
      port: ENV.PORT,
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  }
})
