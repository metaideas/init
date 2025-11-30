import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    server: { port: 3005 },
  },
  imports: false,
  modules: ["@wxt-dev/auto-icons"],
  autoIcons: {
    baseIconPath: "shared/assets/icon.svg",
  },
  srcDir: "src",
  vite: () => ({
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", {}]],
        },
      }),
      tailwindcss(),
    ],
  }),
})
