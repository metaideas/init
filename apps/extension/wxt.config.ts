import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  dev: {
    server: { port: 3006 },
  },
  imports: false,
  modules: ["@wxt-dev/module-react"],
  publicDir: "static",
  srcDir: "src",
  vite: () => ({
    plugins: [
      TanStackRouterVite({
        routesDirectory: "./src/entrypoints/popup/routes",
        generatedRouteTree: "./src/entrypoints/popup/routeTree.gen.ts",
      }),
      TanStackRouterVite({
        routesDirectory: "./src/entrypoints/options/routes",
        generatedRouteTree: "./src/entrypoints/options/routeTree.gen.ts",
      }),
    ],
  }),
})
