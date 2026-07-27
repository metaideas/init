import core from "adamantite/lint"
import node from "adamantite/lint/node"
import react from "adamantite/lint/react"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [core, react, node],
  ignorePatterns: [
    "**/*.hbs",
    "**/src/**/_generated",
    "**/*.d.ts",
    "**/*.gen.ts",
    // The published CLI is a standalone package outside the root workspace. Root type-aware checks
    // make tsgolint panic while resolving its nested relative tsconfig paths.
    "cli/**",
    // TODO: adelrodriguez -- Shadcn registry source is excluded until its generated code is reconciled with Adamantite.
    "packages/ui/**",
  ],
  options: {
    respectEslintDisableDirectives: true,
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ["apps/mobile/babel.config.js", "apps/mobile/metro.config.js"],
      rules: {
        "import/unambiguous": "off",
        "typescript/no-require-imports": "off",
        "unicorn/prefer-module": "off",
      },
    },
  ],
})
