import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  imports: false,
  modules: ["@wxt-dev/module-react"],
  publicDir: "static",
  srcDir: "src",
})
