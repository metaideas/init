import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

export type FilesClientApp = "app" | "web"

type FilesClientAnswers = PlopTypes.Answers & {
  app: FilesClientApp
  dependencyRequired?: boolean
  isInstalled?: boolean
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const SUPPORTED_CLIENT_APPS = ["app", "web"] as const satisfies readonly FilesClientApp[]

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
      const isAstro = answers.app === "web"
      const actions: PlopTypes.Actions = [
        async () => {
          if (!checkIsSupportedFilesClientApp(answers.app))
            throw new Error(
              "Unsupported Files SDK client. Generate the React client in apps/app or the Astro client in apps/web."
            )

          const requiredPaths = [
            "apps/api/src/shared/files.ts",
            "apps/api/src/routes/v1/files.ts",
            `${appPath}/package.json`,
            ...(isAstro
              ? [`${appPath}/.env.template`, `${appPath}/src/shared/env.ts`]
              : [`${appPath}/src/shared/auth.ts`, `${appPath}/src/shared/utils.ts`]),
          ]
          const missingPaths = await getMissingPaths(requiredPaths)
          if (missingPaths.length > 0)
            throw new Error(
              `The files-client generator requires the authenticated /v1/files server from apps/api and the selected app's environment or auth wiring. Restore the API with \`bun template add app api\`. Missing: ${missingPaths.join(", ")}`
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
            : `Prepared the Files SDK ${isAstro ? "Astro" : "React"} client in ${appPath}`
        },
        async () => {
          if (!answers.dependencyRequired) return `[SKIPPED] ${appPath} already contains files-sdk`

          await Bun.$`cd ${appPath} && bun add --exact files-sdk`
          return `${appPath}: installed files-sdk`
        },
        {
          path: clientPath,
          skipIfExists: true,
          templateFile: `templates/files/files-client/${isAstro ? "web" : "react"}.ts.hbs`,
          type: "add",
        },
        async () => {
          if (!isAstro) return "[SKIPPED] React client does not need Astro environment wiring"

          const envPath = `${appPath}/src/shared/env.ts`
          const contents = await Bun.file(envPath).text()
          if (contents.includes("PUBLIC_API_URL:"))
            return `[SKIPPED] ${envPath} already contains PUBLIC_API_URL`

          await Bun.write(
            envPath,
            contents.replace(
              "  client: {\n",
              '  client: {\n    PUBLIC_API_URL: z.url({ protocol: /^https?$/ }).default("http://localhost:3000"),\n'
            )
          )
          return `${envPath}: added PUBLIC_API_URL`
        },
        async () => {
          if (!isAstro) return "[SKIPPED] React client does not need Astro environment wiring"

          const envTemplatePath = `${appPath}/.env.template`
          const contents = await Bun.file(envTemplatePath).text()
          if (contents.includes("PUBLIC_API_URL="))
            return `[SKIPPED] ${envTemplatePath} already contains PUBLIC_API_URL`

          await Bun.write(
            envTemplatePath,
            contents.replace(
              'PUBLIC_SITE_URL="http://localhost:3006"\n',
              'PUBLIC_SITE_URL="http://localhost:3006"\nPUBLIC_API_URL="http://localhost:3000"\n'
            )
          )
          return `${envTemplatePath}: added PUBLIC_API_URL`
        },
        async () => {
          const formatPaths = isAstro
            ? [
                `${appPath}/package.json`,
                clientPath,
                `${appPath}/src/shared/env.ts`,
                `${appPath}/.env.template`,
              ]
            : [`${appPath}/package.json`, clientPath]
          await Bun.$`bun run format -- ${formatPaths}`
          return answers.isInstalled
            ? `[SKIPPED] Files SDK client is already installed in ${appPath}`
            : `Generated the Files SDK ${isAstro ? "Astro" : "React"} client in ${appPath}`
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
    ],
  })
}
