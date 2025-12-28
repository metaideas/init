import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  build: {
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
  },
  clearScreen: false,
  envPrefix: ["PUBLIC_", "TAURI_DEV_HOST"],
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({
      autoCodeSplitting: false,
      target: "react",
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
  ],
  server: {
    hmr: host
      ? {
          host,
          port: 1421,
          protocol: "ws",
        }
      : undefined,
    host: host ?? false,
    port: 3003,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
