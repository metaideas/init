import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import { observability } from "@init/observability/logger/vite"
import tailwindcss from "@tailwindcss/vite"
import { varlockVitePlugin as varlock } from "@varlock/vite-integration"
import { defineConfig } from "wxt"
import { ENV } from "#shared/env.generated.ts"

// See https://wxt.dev/api/config.html
export default defineConfig({
  autoIcons: {
    baseIconPath: "shared/assets/icon.svg",
  },
  dev: {
    server: { port: ENV.PORT },
  },
  imports: false,
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  srcDir: "src",
  vite: () => ({
    plugins: [
      varlock(),
      observability({ service: "extension" }),
      tailwindcss(),
      paraglide({
        outdir: "./src/shared/internationalization",
        project: "../../tooling/internationalization/project.inlang",
        strategy: ["localStorage", "baseLocale"],
      }),
    ],
  }),
})
