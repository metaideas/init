import type { PlopTypes } from "@turbo/gen"
import { getAppChoices } from "../../shared/utils"

export function registerNewFeatureGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("new-feature", {
    actions: (answers) => {
      const selectedFiles: string[] = answers?.files ?? []
      const regularFiles = selectedFiles.filter((file) => !["assets", "components"].includes(file))
      const actions: PlopTypes.Actions = []

      if (regularFiles.length > 0) {
        actions.push({
          base: "templates/new-feature/",
          destination: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/",
          globOptions: {},
          templateFiles: regularFiles.map((file) => `templates/new-feature/${file}.ts.hbs`),
          type: "addMany",
        })
      }

      if (selectedFiles.includes("assets")) {
        actions.push({
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
          templateFile: "templates/new-feature/assets/.gitkeep",
          type: "add",
        })
      }

      if (selectedFiles.includes("components")) {
        actions.push({
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
          templateFile: "templates/new-feature/components/.gitkeep",
          type: "add",
        })
      }

      return actions
    },
    description: "Generate a new feature with customizable file selection",
    prompts: [
      {
        choices: getAppChoices(),
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
