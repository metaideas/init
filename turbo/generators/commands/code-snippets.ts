import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

type CodeSnippetsAnswers = PlopTypes.Answers & {
  utilities?: Array<"assert" | "codec">
  corePackage?: string
}

export function registerCodeSnippetsGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("code-snippets", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as CodeSnippetsAnswers

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
              Object.entries(dependencies).toSorted(([left], [right]) => left.localeCompare(right))
            )
            await Bun.write(utilsPackageJsonPath, `${JSON.stringify(utilsPackageJson, null, 2)}\n`)
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
    },
    description: "Add reusable code snippets to the project",
    prompts: [
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
      },
    ],
  })
}
