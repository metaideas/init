import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

type FilesClientAnswers = PlopTypes.Answers & {
  app: string
  dependencyRequired?: boolean
  endpoint: string
  isInstalled?: boolean
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function getMissingPaths(paths: readonly string[]): Promise<string[]> {
  const checks = await Promise.all(
    paths.map(async (path) => ({ exists: await Bun.file(path).exists(), path }))
  )
  return checks.filter(({ exists }) => !exists).map(({ path }) => path)
}

export function registerFilesClientGenerator(plop: PlopTypes.NodePlopAPI): void {
  const apps = [
    ...new Bun.Glob("*/package.json").scanSync({
      cwd: `${process.cwd()}/apps`,
    }),
  ]
    .map((entry) => entry.split("/")[0])
    .filter((app): app is string => app !== undefined)
    .toSorted()

  plop.setGenerator("files-client", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as FilesClientAnswers
      const appPath = `apps/${answers.app}`
      const clientPath = `${appPath}/src/shared/files.ts`
      const actions: PlopTypes.Actions = [
        async () => {
          const requiredPaths = [
            "apps/api/src/shared/files.ts",
            "apps/api/src/routes/files.ts",
            `${appPath}/package.json`,
          ]
          const missingPaths = await getMissingPaths(requiredPaths)
          if (missingPaths.length > 0)
            throw new Error(
              `The files-client generator requires the /files server from apps/api and the selected app workspace. Restore the API with \`bun template add app api\`. Missing: ${missingPaths.join(", ")}`
            )

          const [routes, packageJson, hasClient] = await Promise.all([
            Bun.file("apps/api/src/routes/index.ts").text(),
            Bun.file(`${appPath}/package.json`).json() as Promise<PackageJson>,
            Bun.file(clientPath).exists(),
          ])
          if (!routes.includes('.route("/files", filesRoutes)'))
            throw new Error(
              "The files-client generator requires the Files SDK server mounted at /files in apps/api."
            )

          const installedPackages = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          }
          answers.dependencyRequired = !("files-sdk" in installedPackages)
          answers.isInstalled = hasClient && !answers.dependencyRequired

          return answers.isInstalled
            ? `Prepared the existing Files SDK client in ${appPath}`
            : `Prepared the Files SDK React client in ${appPath}`
        },
        async () => {
          if (!answers.dependencyRequired) return `[SKIPPED] ${appPath} already contains files-sdk`

          await Bun.$`cd ${appPath} && bun add --exact files-sdk`
          return `${appPath}: installed files-sdk`
        },
        {
          path: clientPath,
          skipIfExists: true,
          templateFile: "templates/files/files-client/react.ts.hbs",
          type: "add",
        },
        async () => {
          await Bun.$`bun run format -- ${appPath}/package.json ${clientPath}`
          return answers.isInstalled
            ? `[SKIPPED] Files SDK client is already installed in ${appPath}`
            : `Generated the Files SDK React client in ${appPath}`
        },
      ]

      return actions
    },
    description: "Generate a Files SDK client",
    prompts: [
      {
        choices:
          apps.length > 0
            ? apps.map((app) => ({ name: app, value: app }))
            : [{ name: "No supported client apps found", value: "" }],
        message: "Which app should receive the Files SDK client?",
        name: "app",
        type: "list",
      },
      {
        default: "https://api.init.localhost/files",
        message: "What is the Files SDK endpoint?",
        name: "endpoint",
        type: "input",
      },
    ],
  })
}
