import type { KnipConfig } from "knip"
import analyze from "adamantite/analyze"

const config: KnipConfig = {
  ...analyze,
  ignoreExportsUsedInFile: true,
  ignoreFiles: [],
  ignoreIssues: {
    "**/env.generated.ts": ["exports", "types"],
  },
  rules: {
    ...analyze.rules,
    binaries: "error",
    dependencies: "warn",
    devDependencies: "off",
    duplicates: "warn",
    enumMembers: "off",
    exports: "warn",
    files: "warn",
    nsExports: "warn",
    nsTypes: "warn",
    optionalPeerDependencies: "warn",
    types: "warn",
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
      entry: ["src/entrypoints/**/*.{ts,tsx}", "src/shared/env.generated.ts"],
      project: "src/**/*.{css,js,jsx,ts,tsx}",
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
    "packages/db": {
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
}

export default config
