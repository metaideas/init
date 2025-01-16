import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  publicDir: "static",
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
})
