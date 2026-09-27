import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import core from "adamantite/lint"
import node from "adamantite/lint/node"
import react from "adamantite/lint/react"
import { defineConfig, type OxlintOverride } from "oxlint"

const LAYER_MESSAGE =
  "Application imports flow shared → features → routes and entrypoints. See AGENTS.md."

const RESTRICTED_IMPORTS = [
  { files: "apps/app/src/routes/**", group: ["#routes/**"] },
  { files: "apps/desktop/src/renderer/**", group: ["#shell/**"] },
  { files: "apps/desktop/src/renderer/routes/**", group: ["#renderer/routes/**", "#shell/**"] },
  { files: "apps/docs/src/pages/**", group: ["#pages/**"] },
  { files: "apps/mobile/src/app/**", group: ["#app/**"] },
  { files: "apps/web/src/pages/**", group: ["#pages/**"] },
] as const

function allowOnlySubpathImports(files: string, allowed: readonly string[]): OxlintOverride {
  return {
    files: [files],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["#*", "#*/**", ...allowed.map((subpath) => `!${subpath}/**`)],
              message: LAYER_MESSAGE,
            },
          ],
        },
      ],
    },
  }
}

function restrictImports(files: string, group: readonly string[]): OxlintOverride {
  return {
    files: [files],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: [...group], message: LAYER_MESSAGE }] },
      ],
    },
  }
}

function listFeatures(app: string) {
  const featuresDirectory = path.join(import.meta.dirname, "apps", app, "src", "features")

  if (!existsSync(featuresDirectory)) {
    return []
  }

  return readdirSync(featuresDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

const featureOverrides = readdirSync(path.join(import.meta.dirname, "apps")).flatMap((app) =>
  listFeatures(app).map((feature) =>
    allowOnlySubpathImports(`apps/${app}/src/features/${feature}/**`, [
      "#shared",
      `#features/${feature}`,
    ])
  )
)

export default defineConfig({
  extends: [core, react, node],
  ignorePatterns: [
    "**/*.hbs",
    "**/src/**/_generated",
    "**/*.d.ts",
    "**/*.gen.ts",
    "**/*.generated.ts",
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
      files: ["**/src/**"],
      rules: {
        "import/no-relative-parent-imports": "error",
      },
    },
    allowOnlySubpathImports("apps/*/src/shared/**", ["#shared"]),
    ...featureOverrides,
    ...RESTRICTED_IMPORTS.map(({ files, group }) => restrictImports(files, group)),
    {
      files: ["packages/native-ui/**"],
      rules: {
        // oxlint cannot resolve the `export *` re-exports in the @rn-primitives dist bundles.
        "import/namespace": "off",
      },
    },
    {
      files: ["apps/mobile/babel.config.js", "apps/mobile/metro.config.js"],
      rules: {
        "import/unambiguous": "off",
        "typescript/no-require-imports": "off",
        "typescript/no-var-requires": "off",
        "unicorn/prefer-module": "off",
      },
    },
  ],
  rules: {
    "typescript/consistent-type-definitions": ["error", "type"],
  },
})
