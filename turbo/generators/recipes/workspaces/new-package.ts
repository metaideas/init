import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

export function registerNewPackageGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("new-package", {
    actions: [
      {
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/new-package/package.package.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/new-package/package.tsconfig.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
        type: "add",
      },
      async (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          await Bun.$`bun install`
          return "Package scaffolded"
        }

        return "Package not scaffolded"
      },
    ],
    description: "Generate a new package for the monorepo",
    prompts: [
      {
        message: "What is the name of the package?",
        name: "name",
        prefix: "@init/",
        type: "input",
      },
    ],
  })
}
