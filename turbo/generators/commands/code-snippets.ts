import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

import { getAnswerStrings, readPackageJson, readPackageName, requireAnswers } from "../boundaries"

type CodeSnippetsAnswers = PlopTypes.Answers & {
  utilities?: Array<"assert" | "codec">
  corePackage?: string
}

export function registerCodeSnippetsGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("code-snippets", {
    actions: (rawAnswers) => {
      const providedAnswers = requireAnswers(rawAnswers)
      const utilities = getAnswerStrings(providedAnswers, "utilities").filter(
        (utility): utility is "assert" | "codec" => utility === "assert" || utility === "codec"
      )
      const answers: CodeSnippetsAnswers = Object.assign(providedAnswers, { utilities })

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
            const corePackageName = await readPackageName("packages/core/package.json")
            const utilsPackageJsonPath = "packages/utils/package.json"
            const utilsPackageJson = await readPackageJson(utilsPackageJsonPath)
            const dependencies = utilsPackageJson.dependencies ?? {}

            answers.corePackage = corePackageName
            if (dependencies[corePackageName] === "workspace:*")
              return `[SKIPPED] ${utilsPackageJsonPath} already contains ${corePackageName}`

            dependencies[corePackageName] = "workspace:*"
            utilsPackageJson.dependencies = Object.fromEntries(
              Object.entries(dependencies).toSorted(([left], [right]) => left.localeCompare(right))
            )
            await Bun.write(utilsPackageJsonPath, `${JSON.stringify(utilsPackageJson, null, 2)}\n`)
            return `${utilsPackageJsonPath}: added ${corePackageName}`
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
        validate: (values: string[]) => values.length > 0 || "Select at least one snippet",
      },
    ],
  })
}
