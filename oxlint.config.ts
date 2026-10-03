import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import core from "adamantite/lint"
import node from "adamantite/lint/node"
import react from "adamantite/lint/react"
import reactStrict from "adamantite/lint/react-strict"
import strict from "adamantite/lint/strict"
import { defineConfig, type OxlintOverride } from "oxlint"

const LAYER_MESSAGE =
  "Application imports flow shared → features → routes and entrypoints. See AGENTS.md."

const RELATIVE_MODULE_IMPORTS = ["./**", "!./**/*.{avif,css,gif,jpeg,jpg,png,svg,webp}"] as const

const RESTRICTED_IMPORTS = [
  { files: "apps/app/src/routes/**", group: [...subpath("#routes"), ...RELATIVE_MODULE_IMPORTS] },
  { files: "apps/desktop/src/renderer/**", group: subpath("#shell") },
  {
    files: "apps/desktop/src/renderer/routes/**",
    group: [...subpath("#renderer/routes"), ...subpath("#shell"), ...RELATIVE_MODULE_IMPORTS],
  },
  { files: "apps/docs/src/pages/**", group: [...subpath("#pages"), ...RELATIVE_MODULE_IMPORTS] },
  { files: "apps/mobile/src/app/**", group: [...subpath("#app"), ...RELATIVE_MODULE_IMPORTS] },
  { files: "apps/web/src/pages/**", group: [...subpath("#pages"), ...RELATIVE_MODULE_IMPORTS] },
]

function subpath(root: string) {
  return [root, `${root}/**`]
}

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

function listDirectories(...segments: string[]) {
  const directory = path.join(import.meta.dirname, ...segments)

  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

const featureOverrides = listDirectories("apps").flatMap((app) =>
  listDirectories("apps", app, "src", "features").map((feature) =>
    allowOnlySubpathImports(`apps/${app}/src/features/${feature}/**`, [
      "#shared",
      `#features/${feature}`,
    ])
  )
)

export default defineConfig({
  extends: [core, strict, react, reactStrict, node],
  ignorePatterns: [
    "**/*.hbs",
    "**/src/**/_generated",
    "**/*.d.ts",
    "**/*.gen.ts",
    "**/*.generated.ts",
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
      files: ["packages/ui/**"],
      rules: {
        // shadcn components put ARIA roles on styled divs; native tags such as `fieldset` add their own styling and behavior.
        "jsx-a11y/prefer-tag-over-role": "off",
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
    "adamantite/no-react-state-hooks": [
      "error",
      { allow: ["**/use[A-Z]*.{ts,tsx}", "**/use-*.{ts,tsx}", "**/hooks/**", "**/hooks.{ts,tsx}"] },
    ],
    "react/jsx-no-constructed-context-values": "off",
    "typescript/consistent-type-definitions": ["error", "type"],
  },
})
