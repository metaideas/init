import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { ensureEnv } from "@tooling/env/vite"
import { defineConfig } from "wxt"

// See https://wxt.dev/api/config.html
export default defineConfig({
  autoIcons: {
    baseIconPath: "shared/assets/icon.svg",
  },
  dev: {
    server: { port: 3005 },
  },
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  srcDir: "src",
  vite: ({ mode }) => {
    void ensureEnv(mode)

    return {
      plugins: [
        tailwindcss(),
        paraglide({
          outdir: "./src/shared/internationalization",
          project: "../../tooling/internationalization/project.inlang",
          strategy: ["baseLocale"],
        }),
      ],
    }
  },
})
