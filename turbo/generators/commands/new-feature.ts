import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

import { getAnswerString, getAnswerStrings, requireAnswers } from "../boundaries"

type NewFeatureAnswers = PlopTypes.Answers & {
  app: string
  files: string[] | string
  name: string
}

export function registerNewFeatureGenerator(plop: PlopTypes.NodePlopAPI): void {
  const apps = [
    ...new Bun.Glob("*/package.json").scanSync({
      cwd: `${process.cwd()}/apps`,
    }),
  ]
    .map((entry) => entry.split("/")[0])
    .filter((app): app is string => app !== undefined)
    .toSorted()

  plop.setGenerator("new-feature", {
    actions: (rawAnswers) => {
      const providedAnswers = requireAnswers(rawAnswers)
      const answers: NewFeatureAnswers = Object.assign(providedAnswers, {
        app: getAnswerString(providedAnswers, "app"),
        files: getAnswerStrings(providedAnswers, "files"),
        name: getAnswerString(providedAnswers, "name"),
      })
      const app = plop.renderString("{{kebabCase value}}", { value: answers.app })
      const feature = plop.renderString("{{kebabCase value}}", { value: answers.name })
      const destination = `apps/${app}/src/features/${feature}`
      const selectedFiles = Array.isArray(answers.files)
        ? answers.files
        : answers.files.split(",").map((file) => file.trim())
      const generatedFiles = selectedFiles.filter(
        (file) => file !== "assets" && file !== "components"
      )
      const pathsToFormat = generatedFiles.map((file) => `${destination}/${file}.ts`)
      const actions: PlopTypes.Actions = []

      if (generatedFiles.length > 0) {
        actions.push({
          base: "templates/scaffolds/new-feature/",
          destination: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/",
          globOptions: {},
          skipIfExists: true,
          templateFiles: generatedFiles.map(
            (file) => `templates/scaffolds/new-feature/${file}.ts.hbs`
          ),
          type: "addMany",
        })
      }

      if (selectedFiles.includes("assets")) {
        actions.push({
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
          skipIfExists: true,
          templateFile: "templates/scaffolds/new-feature/assets/.gitkeep",
          type: "add",
        })
      }

      if (selectedFiles.includes("components")) {
        actions.push({
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
          skipIfExists: true,
          templateFile: "templates/scaffolds/new-feature/components/.gitkeep",
          type: "add",
        })
      }

      actions.push(async () => {
        const checkedPaths = await Promise.all(
          pathsToFormat.map(async (path) => ((await Bun.file(path).exists()) ? path : undefined))
        )
        const existingPaths = checkedPaths.filter((path): path is string => path !== undefined)

        if (existingPaths.length === 0) return `[SKIPPED] No generated files need formatting`

        await Bun.$`bun run format -- ${existingPaths}`
        return `Created feature ${feature} in apps/${app}`
      })

      return actions
    },
    description: "Generate a new feature with customizable file selection",
    prompts: [
      {
        choices:
          apps.length > 0
            ? apps.map((app) => ({ name: app, value: app }))
            : [{ name: "No apps found", value: "" }],
        message: "Which app would you like to add the feature to?",
        name: "app",
        type: "list",
      },
      {
        message: "What is the name of the feature?",
        name: "name",
        type: "input",
      },
      {
        choices: [
          { checked: true, name: "types.ts - Type definitions", value: "types" },
          { checked: true, name: "utils.ts - Utility functions", value: "utils" },
          {
            checked: true,
            name: "validation.ts - Validation schemas",
            value: "validation",
          },
          { checked: true, name: "hooks.ts - Custom hooks", value: "hooks" },
          { checked: true, name: "stores.ts - State management", value: "stores" },
          {
            checked: false,
            name: "server/functions.ts - Server functions (web apps)",
            value: "server/functions",
          },
          { checked: false, name: "queries.ts - Query hooks", value: "queries" },
          { checked: false, name: "mutations.ts - Mutation hooks", value: "mutations" },
          {
            checked: false,
            name: "services.ts - Service functions (browser extensions)",
            value: "services",
          },
          { checked: false, name: "router.ts - API router (API apps)", value: "router" },
          {
            checked: false,
            name: "procedures.ts - tRPC procedures (API apps)",
            value: "procedures",
          },
          { checked: true, name: "assets/ - Assets directory", value: "assets" },
          {
            checked: true,
            name: "components/ - Components directory",
            value: "components",
          },
        ],
        message: "Which files would you like to include?",
        name: "files",
        type: "checkbox",
      },
    ],
  })
}
