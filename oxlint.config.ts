import { defineConfig } from "oxlint"
import core from "adamantite/lint"
import react from "adamantite/lint/react"
import node from "adamantite/lint/node"

export default defineConfig({
  options: {
  "typeAware": true,
  "typeCheck": true
},
  ignorePatterns: [
  "**/*.hbs",
  "**/src/**/_generated",
  "**/*.d.ts",
  "**/*.gen.ts",
  "cli/**"
],
  overrides: [
  {
    "files": [
      "apps/mobile/babel.config.js",
      "apps/mobile/metro.config.js"
    ],
    "rules": {
      "import/unambiguous": "off"
    }
  }
],
  extends: [core, react, node],
})
