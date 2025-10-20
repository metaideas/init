import Bun from "bun"
import type { PlopTypes } from "@turbo/gen"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("new-feature", {
    description: "Generate a new feature with customizable file selection",
    prompts: [
      {
        type: "list",
        name: "app",
        message: "Which app would you like to add the feature to?",
        choices: getAppChoices,
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
      {
        type: "checkbox",
        name: "files",
        message: "Which files would you like to include?",
        choices: [
          {
            name: "types.ts - Type definitions",
            value: "types",
            checked: true,
          },
          {
            name: "utils.ts - Utility functions",
            value: "utils",
            checked: true,
          },
          {
            name: "validation.ts - Validation schemas",
            value: "validation",
            checked: true,
          },
          { name: "hooks.ts - Custom hooks", value: "hooks", checked: true },
          {
            name: "stores.ts - State management",
            value: "stores",
            checked: true,
          },
          {
            name: "server/functions.ts - Server functions (web apps)",
            value: "server/functions",
            checked: false,
          },
          {
            name: "queries.ts - Query hooks",
            value: "queries",
            checked: false,
          },
          {
            name: "mutations.ts - Mutation hooks",
            value: "mutations",
            checked: false,
          },
          {
            name: "services.ts - Service functions (browser extensions)",
            value: "services",
            checked: false,
          },
          {
            name: "router.ts - API router (API apps)",
            value: "router",
            checked: false,
          },
          {
            name: "procedures.ts - tRPC procedures (API apps)",
            value: "procedures",
            checked: false,
          },
          {
            name: "assets/ - Assets directory",
            value: "assets",
            checked: true,
          },
          {
            name: "components/ - Components directory",
            value: "components",
            checked: true,
          },
        ],
      },
    ],
    actions: (answers) => {
      const selectedFiles: string[] = answers?.files || []

      // Handle regular files (where template name matches file name)
      const regularFiles = selectedFiles.filter(
        (f) => !["assets", "components"].includes(f)
      )

      const actions: PlopTypes.Actions = []

      if (regularFiles.length > 0) {
        actions.push({
          type: "addMany",
          destination:
            "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/",
          base: "templates/new-feature/",
          templateFiles: regularFiles.map(
            (f) => `templates/new-feature/${f}.ts.hbs`
          ),
        })
      }

      // Handle special directory files
      if (selectedFiles.includes("assets")) {
        actions.push({
          type: "add",
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/assets/.gitkeep",
          templateFile: "templates/new-feature/assets/.gitkeep",
        })
      }

      if (selectedFiles.includes("components")) {
        actions.push({
          type: "add",
          path: "apps/{{kebabCase app}}/src/features/{{kebabCase name}}/components/.gitkeep",
          templateFile: "templates/new-feature/components/.gitkeep",
        })
      }

      return actions
    },
  })

  plop.setGenerator("new-package", {
    description: "Generate a new package for the monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the package?",
        prefix: "@init/",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/new-package/package.package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/new-package/package.tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
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
  })

  plop.setGenerator("trpc-client", {
    description: "Set up a tRPC client for an app",
    prompts: [
      {
        type: "list",
        name: "app",
        message: "Which app would you like to add the tRPC client to?",
        choices: getAppChoices,
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/shared/trpc.tsx",
        templateFile: "templates/trpc-client/trpc.tsx.hbs",
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
  })

  plop.setGenerator("hono-client", {
    description: "Set up a Hono client for an app",
    prompts: [
      {
        type: "list",
        name: "app",
        message: "Which app would you like to add the Hono client to?",
        choices: getAppChoices,
      },
    ],
    actions: [
      {
        type: "add",
        path: "apps/{{kebabCase app}}/src/shared/api.ts",
        templateFile: "templates/hono-client/api.ts.hbs",
      },
      async (answers) => {
        /**
         * Install hono and api package
         */
        if ("app" in answers && typeof answers.app === "string") {
          const appPath = `apps/${answers.app}`

          // Install npm packages
          await Bun.$`cd ${appPath} && bun add hono`

          // Add workspace dependencies
          await addWorkspaceDependencies(appPath, ["api"], true)

          return "Packages installed"
        }

        return "Packages not installed"
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
      .sort()
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

  if (!pkgJson[depKey]) {
    pkgJson[depKey] = {}
  }

  for (const pkg of packages) {
    pkgJson[depKey][pkg] = "workspace:*"
  }

  // Write updated package.json
  await Bun.write(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`)

  // Install all dependencies
  await Bun.$`cd ${packagePath} && bun install`
}
