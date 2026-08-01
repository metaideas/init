import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { ensureEnv } from "@tooling/env/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(async ({ mode }) => {
  await ensureEnv(mode, import.meta.dirname)
  const host = process.env.TAURI_DEV_HOST

  return {
    build: {
      minify: process.env.TAURI_ENV_DEBUG ? false : ("oxc" as const),
      sourcemap: !!process.env.TAURI_ENV_DEBUG,
      target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    },
    clearScreen: false,
    envPrefix: ["PUBLIC_", "TAURI_DEV_HOST"],
    plugins: [
      devtools(),
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
      port: Number(process.env.PORT ?? 3003),
      strictPort: true,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },
  }
})
