import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

export type FilesClientApp = "app"

type FilesClientAnswers = PlopTypes.Answers & {
  app: FilesClientApp
  dependencyRequired?: boolean
  isInstalled?: boolean
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const SUPPORTED_CLIENT_APPS = ["app"] as const satisfies readonly FilesClientApp[]

export function checkIsSupportedFilesClientApp(app: string): app is FilesClientApp {
  return SUPPORTED_CLIENT_APPS.some((supportedApp) => supportedApp === app)
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
    .filter(
      (app): app is FilesClientApp => app !== undefined && checkIsSupportedFilesClientApp(app)
    )
    .toSorted()

  plop.setGenerator("files-client", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as FilesClientAnswers
      const appPath = `apps/${answers.app}`
      const clientPath = `${appPath}/src/shared/files.ts`
      const actions: PlopTypes.Actions = [
        async () => {
          if (!checkIsSupportedFilesClientApp(answers.app))
            throw new Error(
              "Unsupported Files SDK client. Generate the React client in apps/app. React Native and clients without authenticated API wiring are not supported."
            )

          const requiredPaths = [
            "apps/api/src/shared/files.ts",
            "apps/api/src/routes/v1/files.ts",
            `${appPath}/package.json`,
            `${appPath}/src/shared/auth.ts`,
            `${appPath}/src/shared/utils.ts`,
          ]
          const missingPaths = await getMissingPaths(requiredPaths)
          if (missingPaths.length > 0)
            throw new Error(
              `The files-client generator requires the authenticated /v1/files server from apps/api and apps/app auth wiring. Restore the API with \`bun template add app api\`. Missing: ${missingPaths.join(", ")}`
            )

          const [v1Routes, packageJson, hasClient] = await Promise.all([
            Bun.file("apps/api/src/routes/v1/index.ts").text(),
            Bun.file(`${appPath}/package.json`).json() as Promise<PackageJson>,
            Bun.file(clientPath).exists(),
          ])
          if (!v1Routes.includes('.route("/files", filesRoutes)'))
            throw new Error(
              "The files-client generator requires the Files SDK server mounted at /v1/files in apps/api."
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
    description: "Generate an authenticated Files SDK React client",
    prompts: [
      {
        choices:
          apps.length > 0
            ? apps.map((app) => ({ name: app, value: app }))
            : [{ name: "No supported React apps found", value: "" }],
        message: "Which app should receive the Files SDK client?",
        name: "app",
        type: "list",
      },
    ],
  })
}
