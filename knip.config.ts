import type { KnipConfig } from "knip"
import analyze from "adamantite/analyze"

const config: KnipConfig = {
  ...analyze,
  ignore: ["**/*.d.ts"],
  ignoreExportsUsedInFile: true,
  ignoreFiles: [],
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
      project: ["scripts/**/*.ts", "turbo/generators/**/*.ts"],
    },
    "apps/*": {
      project: "src/**/*.{js,jsx,ts,tsx}",
    },
    "apps/app": {
      entry: "src/routeTree.gen.{ts,js}",
    },
    "apps/desktop": {
      entry: "src/shared/env.ts",
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "apps/docs": {
      project: "src/**/*.{astro,css,js,jsx,mdx,ts,tsx}",
    },
    "apps/extension": {
      entry: ["src/entrypoints/**/*.{ts,tsx}", "src/shared/env.ts"],
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "apps/mobile": {
      project: "src/**/*.{css,js,jsx,ts,tsx}",
    },
    "apps/web": {
      entry: "src/shared/env.ts",
      project: "src/**/*.{astro,css,js,jsx,mdx,ts,tsx}",
    },
    cli: {
      entry: ["src/index.ts", "bunup.config.ts"],
      ignoreBinaries: ["bunup"],
      project: "src/**/*.ts",
    },
    "packages/*": {
      project: "src/**/*.{js,jsx,ts,tsx}",
    },
    "packages/db": {
      drizzle: {
        config: [],
        entry: ["drizzle.config.ts", "src/schema.ts"],
      },
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
