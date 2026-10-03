import type { KnipConfig } from "knip"
import analyze, { ignoreDependencies } from "adamantite/analyze"

export default {
  ...analyze,
  ignoreDependencies: ignoreDependencies.monorepo,
  ignoreExportsUsedInFile: true,
  ignoreFiles: [],
  ignoreIssues: {
    "**/env.generated.ts": ["exports", "types"],
  },
  rules: {
    ...analyze.rules,
    binaries: "error",
    dependencies: "error",
    devDependencies: "off",
    duplicates: "error",
    enumMembers: "off",
    exports: "error",
    files: "error",
    nsExports: "error",
    nsTypes: "error",
    optionalPeerDependencies: "warn",
    types: "error",
    unlisted: "error",
    unresolved: "error",
  },
  workspaces: {
    ".": {
      entry: "turbo/generators/config.ts",
      project: "turbo/generators/**/*.ts",
    },
    "apps/*": {
      project: "src/**/*.{js,jsx,ts,tsx}",
    },
    "apps/app": {
      entry: "src/routeTree.gen.{ts,js}",
      vite: false,
    },
    "apps/desktop": {
      entry: [
        "src/shared/env.generated.ts",
        "src/shell/main.ts",
        "src/shell/preload.ts",
        "forge.config.ts",
      ],
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "apps/docs": {
      project: "src/**/*.{astro,css,js,jsx,mdx,ts,tsx}",
    },
    "apps/extension": {
      entry: ["src/entrypoints/**/*.{ts,tsx}", "src/shared/env.generated.ts", "wxt.config.ts"],
      project: "src/**/*.{css,js,jsx,ts,tsx}",
      wxt: false,
    },
    "apps/mobile": {
      entry: "src/shared/env.generated.ts",
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "apps/web": {
      entry: "src/shared/env.generated.ts",
      project: "src/**/*.{astro,css,js,jsx,mdx,ts,tsx}",
    },
    "packages/*": {
      project: "src/**/*.{js,jsx,ts,tsx}",
    },
    "packages/database": {
      drizzle: {
        config: [],
        entry: ["drizzle.config.ts", "src/schema.ts"],
      },
      entry: ["scripts/*.ts"],
    },
    "packages/native-ui": {
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "packages/ui": {
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
  },
} satisfies KnipConfig
