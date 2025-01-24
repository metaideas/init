import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  dev: {
    server: { port: 3004 },
  },
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  publicDir: "static",
  srcDir: "src",
  vite: () => ({
    plugins: [TanStackRouterVite()],
  }),
})
