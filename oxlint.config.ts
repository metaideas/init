import core from "adamantite/lint"
import node from "adamantite/lint/node"
import react from "adamantite/lint/react"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [core, react, node],
  ignorePatterns: ["**/*.hbs", "**/src/**/_generated", "**/*.d.ts", "**/*.gen.ts", "cli/**"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ["apps/mobile/babel.config.js", "apps/mobile/metro.config.js"],
      rules: {
        "import/unambiguous": "off",
      },
    },
  ],
})
