import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    server: { port: 3004 },
  },
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  autoIcons: {
    baseIconPath: "shared/assets/icon.svg",
  },
  srcDir: "src",
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
