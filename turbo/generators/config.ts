import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("new-feature", {
    actions: (answers) => {
      const selectedFiles: string[] = answers?.files ?? []

      // Handle regular files (where template name matches file name)
      const regularFiles = selectedFiles.filter((f) => !["assets", "components"].includes(f))

      const actions: PlopTypes.Actions = []

      if (regularFiles.length > 0) {
        actions.push({
          base: "templates/new-feature/",
          destination: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/",
          templateFiles: regularFiles.map((f) => `templates/new-feature/${f}.ts.hbs`),
          type: "addMany",
        })
      }

      // Handle special directory files
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
        choices: getAppChoices,
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
          {
            checked: true,
            name: "types.ts - Type definitions",
            value: "types",
          },
          {
            checked: true,
            name: "utils.ts - Utility functions",
            value: "utils",
          },
          {
            checked: true,
            name: "validation.ts - Validation schemas",
            value: "validation",
          },
          { checked: true, name: "hooks.ts - Custom hooks", value: "hooks" },
          {
            checked: true,
            name: "stores.ts - State management",
            value: "stores",
          },
          {
            checked: false,
            name: "server/functions.ts - Server functions (web apps)",
            value: "server/functions",
          },
          {
            checked: false,
            name: "queries.ts - Query hooks",
            value: "queries",
          },
          {
            checked: false,
            name: "mutations.ts - Mutation hooks",
            value: "mutations",
          },
          {
            checked: false,
            name: "services.ts - Service functions (browser extensions)",
            value: "services",
          },
          {
            checked: false,
            name: "router.ts - API router (API apps)",
            value: "router",
          },
          {
            checked: false,
            name: "procedures.ts - tRPC procedures (API apps)",
            value: "procedures",
          },
          {
            checked: true,
            name: "assets/ - Assets directory",
            value: "assets",
          },
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
        /**
         * Install all dependencies
         */
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

  plop.setGenerator("trpc-client", {
    actions: [
      {
        path: "apps/{{kebabCase app}}/src/shared/trpc.tsx",
        templateFile: "templates/trpc-client/trpc.tsx.hbs",
        type: "add",
      },
      async (answers) => {
        /**
         * Install tRPC client packages and api package
         */
        if ("app" in answers && typeof answers.app === "string") {
          const appPath = `apps/${answers.app}`

          // Install npm packages
          await Bun.$`cd ${appPath} && bun add @trpc/client @trpc/tanstack-react-query @tanstack/react-query`

          // Add workspace dependencies
          await addWorkspaceDependencies(appPath, ["api"], true)

          return "Packages installed"
        }

        return "Packages not installed"
      },
    ],
    description: "Set up a tRPC client for an app",
    prompts: [
      {
        choices: getAppChoices,
        message: "Which app would you like to add the tRPC client to?",
        name: "app",
        type: "list",
      },
    ],
  })

  plop.setGenerator("hono-client", {
    actions: [
      {
        path: "apps/{{kebabCase app}}/src/shared/api.ts",
        templateFile: "templates/hono-client/api.ts.hbs",
        type: "add",
      },
      async (answers) => {
        /**
         * Install hono and api package
         */
        if ("app" in answers && typeof answers.app === "string") {
          const appPath = `apps/${answers.app}`

          // Add workspace dependencies
          await addWorkspaceDependencies(appPath, ["api"])

          return "Packages installed"
        }

        return "Packages not installed"
      },
    ],
    description: "Set up a Hono client for an app",
    prompts: [
      {
        choices: getAppChoices,
        message: "Which app would you like to add the Hono client to?",
        name: "app",
        type: "list",
      },
    ],
  })
}

async function getAvailableApps(): Promise<string[]> {
  try {
    const appsDir = `${process.cwd()}/apps`
    const glob = new Bun.Glob("*/package.json")
    const entries = await Array.fromAsync(glob.scan({ cwd: appsDir }))
    return entries
      .map((entry) => entry.split("/")[0])
      .filter((dir): dir is string => dir !== undefined)
      .toSorted()
  } catch {
    return []
  }
}

async function getAppChoices() {
  const apps = await getAvailableApps()
  return apps.length > 0
    ? apps.map((app) => ({ name: app, value: app }))
    : [{ name: "No apps found", value: "" }]
}

async function addWorkspaceDependencies(
  packagePath: string,
  packages: string[],
  dev = false
): Promise<void> {
  const pkgJsonPath = `${packagePath}/package.json`
  const pkgJson = await Bun.file(pkgJsonPath).json()

  const depKey = dev ? "devDependencies" : "dependencies"

  pkgJson[depKey] ??= {}

  for (const pkg of packages) {
    pkgJson[depKey][pkg] = "workspace:*"
  }

  // Write updated package.json
  await Bun.write(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`)

  // Install all dependencies
  await Bun.$`cd ${packagePath} && bun install`
}
