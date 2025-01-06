import { execSync } from "node:child_process"
import type { PlopTypes } from "@turbo/gen"

type PackageJson = {
  name: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("internal-package", {
    description: "Generate a new package for the monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the package?",
        prefix: "@this/",
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile:
          "templates/packages/internal-package/package.package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile:
          "templates/packages/internal-package/package.tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
      },
      {
        type: "modify",
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              const version = await fetch(
                `https://registry.npmjs.org/-/package/${dep}/dist-tags`
              )
                .then(res => res.json())
                .then(json => json.latest)

              if (!pkg.dependencies) {
                pkg.dependencies = {}
              }

              pkg.dependencies[dep] = `^${version}`
            }
            return JSON.stringify(pkg, null, 2)
          }

          return content
        },
      },
      answers => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm sherif --fix", { stdio: "inherit" })
          execSync("pnpm i", { stdio: "inherit" })

          return "Package scaffolded"
        }

        return "Package not scaffolded"
      },
    ],
  })

  plop.setGenerator("web-feature", {
    description: "Generate a new feature for a web app",
    prompts: [
      {
        type: "input",
        name: "app",
        message: "What is the name of the app?",
        default: "web",
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/actions.ts",
        templateFile: "templates/apps/web-feature/actions.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
        templateFile: "templates/apps/web-feature/assets/.gitkeep.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
        templateFile: "templates/apps/web-feature/components/.gitkeep.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/hooks.ts",
        templateFile: "templates/apps/web-feature/hooks.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/loaders.ts",
        templateFile: "templates/apps/web-feature/loaders.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/stores.ts",
        templateFile: "templates/apps/web-feature/stores.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/types.ts",
        templateFile: "templates/apps/web-feature/types.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/validation.ts",
        templateFile: "templates/apps/web-feature/validation.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/utils.ts",
        templateFile: "templates/apps/web-feature/utils.ts.hbs",
      },
    ],
  })

  plop.setGenerator("mobile-feature", {
    description: "Generate a new feature for the mobile app",
    prompts: [
      {
        type: "input",
        name: "app",
        message: "What is the name of the app?",
        default: "mobile",
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
        templateFile: "templates/apps/mobile-feature/assets/.gitkeep.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
        templateFile: "templates/apps/mobile-feature/components/.gitkeep.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/hooks.ts",
        templateFile: "templates/apps/mobile-feature/hooks.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/mutations.ts",
        templateFile: "templates/apps/mobile-feature/mutations.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/queries.ts",
        templateFile: "templates/apps/mobile-feature/queries.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/stores.ts",
        templateFile: "templates/apps/mobile-feature/stores.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/types.ts",
        templateFile: "templates/apps/mobile-feature/types.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/utils.ts",
        templateFile: "templates/apps/mobile-feature/utils.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/validation.ts",
        templateFile: "templates/apps/mobile-feature/validation.ts.hbs",
      },
    ],
  })

  plop.setGenerator("api-feature", {
    description: "Generate a new feature for the API",
    prompts: [
      {
        type: "input",
        name: "app",
        message: "What is the name of the app?",
        default: "api",
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/router.ts",
        templateFile: "templates/apps/api-feature/router.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/procedures.ts",
        templateFile: "templates/apps/api-feature/procedures.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/types.ts",
        templateFile: "templates/apps/api-feature/types.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/utils.ts",
        templateFile: "templates/apps/api-feature/utils.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/validation.ts",
        templateFile: "templates/apps/api-feature/validation.ts.hbs",
      },
    ],
  })

  plop.setGenerator("desktop-feature", {
    description: "Generate a new feature for the desktop app",
    prompts: [
      {
        type: "input",
        name: "app",
        message: "What is the name of the app?",
        default: "desktop",
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
        templateFile: "templates/apps/desktop-feature/assets/.gitkeep",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
        templateFile: "templates/apps/desktop-feature/components/.gitkeep",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/hooks.ts",
        templateFile: "templates/apps/desktop-feature/hooks.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/mutations.ts",
        templateFile: "templates/apps/desktop-feature/mutations.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/queries.ts",
        templateFile: "templates/apps/desktop-feature/queries.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/stores.ts",
        templateFile: "templates/apps/desktop-feature/stores.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/types.ts",
        templateFile: "templates/apps/desktop-feature/types.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/utils.ts",
        templateFile: "templates/apps/desktop-feature/utils.ts.hbs",
      },
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/validation.ts",
        templateFile: "templates/apps/desktop-feature/validation.ts.hbs",
      },
    ],
  })
}
