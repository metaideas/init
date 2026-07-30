import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

type CodeSnippetsAnswers = PlopTypes.Answers & {
  category: "environment" | "utilities"
  utilities?: Array<"assert" | "codec">
  environmentPresets?: Array<"anthropic" | "openai" | "s3">
  addAnthropic?: boolean
  addOpenai?: boolean
  addS3?: boolean
  corePackage?: string
}

export function registerCodeSnippetsGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("code-snippets", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as CodeSnippetsAnswers

      if (answers.category === "utilities") {
        const actions: PlopTypes.Actions = []

        if (answers.utilities?.includes("codec")) {
          actions.push({
            path: "packages/utils/src/codec.ts",
            skipIfExists: true,
            templateFile: "templates/code-snippets/codec.ts.hbs",
            type: "add",
          })
        }

        if (answers.utilities?.includes("assert")) {
          actions.push(
            async () => {
              const corePackageJson = (await Bun.file("packages/core/package.json").json()) as {
                name: string
              }
              const utilsPackageJsonPath = "packages/utils/package.json"
              const utilsPackageJson = (await Bun.file(utilsPackageJsonPath).json()) as {
                dependencies?: Record<string, string>
              }
              const dependencies = utilsPackageJson.dependencies ?? {}

              answers.corePackage = corePackageJson.name
              if (dependencies[corePackageJson.name] === "workspace:*")
                return `[SKIPPED] ${utilsPackageJsonPath} already contains ${corePackageJson.name}`

              dependencies[corePackageJson.name] = "workspace:*"
              utilsPackageJson.dependencies = Object.fromEntries(
                Object.entries(dependencies).toSorted(([left], [right]) =>
                  left.localeCompare(right)
                )
              )
              await Bun.write(
                utilsPackageJsonPath,
                `${JSON.stringify(utilsPackageJson, null, 2)}\n`
              )
              return `${utilsPackageJsonPath}: added ${corePackageJson.name}`
            },
            {
              path: "packages/utils/src/assert.ts",
              skipIfExists: true,
              templateFile: "templates/code-snippets/assert.ts.hbs",
              type: "add",
            }
          )
        }

        actions.push(async () => {
          const paths = []

          if (answers.utilities?.includes("codec")) paths.push("packages/utils/src/codec.ts")
          if (answers.utilities?.includes("assert")) {
            paths.push("packages/utils/src/assert.ts", "packages/utils/package.json")
            await Bun.$`bun install`
          }

          await Bun.$`bun run format -- ${paths}`
          return `Installed utility snippets: ${answers.utilities?.join(", ")}`
        })

        return actions
      }

      return [
        async () => {
          const presets = await Bun.file("packages/env/src/presets.ts").text()

          answers.addOpenai =
            answers.environmentPresets?.includes("openai") &&
            !presets.includes("export const openai =")
          answers.addAnthropic =
            answers.environmentPresets?.includes("anthropic") &&
            !presets.includes("export const anthropic =")
          answers.addS3 =
            answers.environmentPresets?.includes("s3") && !presets.includes("export const s3 =")

          return "Prepared the selected environment presets"
        },
        {
          path: "packages/env/src/presets.ts",
          pattern: "export const auth =",
          skip: () =>
            answers.addOpenai || answers.addAnthropic || answers.addS3
              ? false
              : "Selected environment presets are already installed",
          templateFile: "templates/code-snippets/environment-presets.ts.hbs",
          type: "modify",
        },
        async () => {
          if (!answers.addOpenai && !answers.addAnthropic && !answers.addS3)
            return "[SKIPPED] Environment presets are already current"

          await Bun.$`bun run format -- packages/env/src/presets.ts`
          return `Installed environment presets: ${answers.environmentPresets?.join(", ")}`
        },
      ]
    },
    description: "Add reusable code snippets to the project",
    prompts: [
      {
        choices: [
          { name: "Utilities", value: "utilities" },
          { name: "Environment presets", value: "environment" },
        ],
        message: "Which code snippet category would you like to use?",
        name: "category",
        type: "list",
      },
      {
        choices: [
          { name: "JSON codec", value: "codec" },
          { name: "Assertions", value: "assert" },
        ],
        message: "Which utility snippets would you like to add?",
        name: "utilities",
        type: "checkbox",
        validate: (values: unknown) =>
          (Array.isArray(values) && values.length > 0) || "Select at least one snippet",
        when: (answers: PlopTypes.Answers) => answers.category === "utilities",
      },
      {
        choices: [
          { name: "OpenAI", value: "openai" },
          { name: "Anthropic", value: "anthropic" },
          { name: "S3", value: "s3" },
        ],
        message: "Which environment presets would you like to add?",
        name: "environmentPresets",
        type: "checkbox",
        validate: (values: unknown) =>
          (Array.isArray(values) && values.length > 0) || "Select at least one preset",
        when: (answers: PlopTypes.Answers) => answers.category === "environment",
      },
    ],
  })
}
