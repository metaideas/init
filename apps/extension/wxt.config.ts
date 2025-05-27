import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
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
    plugins: [
      TanStackRouterVite({
        generatedRouteTree: "src/shared/router/routeTree.gen.ts",
      }),
      tailwindcss(),
    ],
  }),
})
