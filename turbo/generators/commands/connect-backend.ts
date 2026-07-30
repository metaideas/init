import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

type ConnectBackendAnswers = PlopTypes.Answers & {
  app: "app" | "desktop" | "mobile"
  auth: boolean
  backend: "convex" | "hono" | "trpc"
  example: boolean
  apiPackage?: string
  authPackage?: string
  backendPackage?: string
  envPackage?: string
  nativeUiPackage?: string
  utilsPackage?: string
  workspaceDependenciesChanged?: boolean
}

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  name?: string
}

export function registerConnectBackendGenerator(plop: PlopTypes.NodePlopAPI): void {
  const apps = [
    ...new Bun.Glob("*/package.json").scanSync({
      cwd: `${process.cwd()}/apps`,
    }),
  ]
    .map((entry) => entry.split("/")[0])
    .filter((app): app is string => app !== undefined)
    .toSorted()

  plop.setGenerator("connect-backend", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as ConnectBackendAnswers
      const appPath = `apps/${answers.app}`
      const actions: PlopTypes.Actions = []
      const isSupported =
        (answers.app === "mobile" && answers.backend === "convex") ||
        (answers.app === "mobile" && answers.backend === "hono") ||
        (answers.app === "app" && answers.backend === "hono") ||
        (answers.app === "desktop" && answers.backend === "hono") ||
        (answers.app === "app" && answers.backend === "trpc") ||
        (answers.app === "desktop" && answers.backend === "trpc")

      if (!isSupported)
        throw new Error(`Unsupported backend connection: ${answers.app} + ${answers.backend}`)
      if (answers.backend === "convex") answers.auth = true
      if (answers.app === "desktop" && answers.auth)
        throw new Error("Desktop auth wiring is not supported.")

      actions.push(
        async () => {
          if (answers.backend === "convex") {
            const backendPackageJson = (await Bun.file("packages/backend/package.json").json()) as {
              name: string
            }
            const authPackageJson = (await Bun.file("packages/auth/package.json").json()) as {
              name: string
            }
            const envPackageJson = (await Bun.file("packages/env/package.json").json()) as {
              name: string
            }
            const nativeUiPackageJson = (await Bun.file(
              "packages/native-ui/package.json"
            ).json()) as { name: string }

            answers.backendPackage = backendPackageJson.name
            answers.authPackage = authPackageJson.name
            answers.envPackage = envPackageJson.name
            answers.nativeUiPackage = nativeUiPackageJson.name
          } else {
            const apiPackageJson = (await Bun.file("apps/api/package.json").json()) as {
              name: string
            }
            answers.apiPackage = apiPackageJson.name

            if (answers.app !== "app") {
              const envPackageJson = (await Bun.file("packages/env/package.json").json()) as {
                name: string
              }
              const utilsPackageJson = (await Bun.file("packages/utils/package.json").json()) as {
                name: string
              }
              answers.envPackage = envPackageJson.name
              answers.utilsPackage = utilsPackageJson.name
            }

            if (answers.app === "mobile" && (answers.auth || answers.example)) {
              const nativeUiPackageJson = (await Bun.file(
                "packages/native-ui/package.json"
              ).json()) as { name: string }
              answers.nativeUiPackage = nativeUiPackageJson.name
            }

            if (answers.app === "mobile" && answers.auth) {
              const authPackageJson = (await Bun.file("packages/auth/package.json").json()) as {
                name: string
              }
              answers.authPackage = authPackageJson.name
            }
          }

          return `Prepared apps/${answers.app} + ${answers.backend}`
        },
        async () => {
          const packageJsonPath = `${appPath}/package.json`
          const packageJson = (await Bun.file(packageJsonPath).json()) as PackageJson
          const dependencies = packageJson.dependencies ?? {}
          const packageNames =
            answers.backend === "convex"
              ? [answers.authPackage, answers.backendPackage]
              : answers.backend === "hono" && answers.app === "mobile" && answers.auth
                ? [answers.apiPackage, answers.authPackage]
                : [answers.apiPackage]
          const missingPackageNames = packageNames
            .filter((name): name is string => name !== undefined)
            .filter((name) => dependencies[name] !== "workspace:*")

          if (missingPackageNames.length === 0) {
            answers.workspaceDependenciesChanged = false
            return `[SKIPPED] ${packageJsonPath} already contains its workspace dependencies`
          }

          for (const packageName of missingPackageNames) {
            dependencies[packageName] = "workspace:*"
          }
          packageJson.dependencies = Object.fromEntries(
            Object.entries(dependencies).toSorted(([left], [right]) => left.localeCompare(right))
          )
          await Bun.write(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
          answers.workspaceDependenciesChanged = true
          return `${packageJsonPath}: added ${missingPackageNames.join(", ")}`
        }
      )

      if (answers.backend === "convex") {
        const providersPath = "apps/mobile/src/shared/components/providers.tsx"
        const envPath = "apps/mobile/src/shared/env.ts"

        actions.push(
          {
            path: "apps/mobile/src/shared/components/convex-provider.tsx",
            skipIfExists: true,
            templateFile: "templates/backend-clients/convex/mobile/convex-provider.tsx.hbs",
            type: "add",
          },
          {
            path: "apps/mobile/src/shared/auth.ts",
            skipIfExists: true,
            templateFile: "templates/backend-clients/convex/mobile/auth.ts.hbs",
            type: "add",
          },
          {
            path: envPath,
            pattern: /import \{ sentry \} from "[^"]+\/presets"/,
            skip: async () => {
              const contents = await Bun.file(envPath).text()
              return contents.includes("import { convex, sentry }")
                ? `${envPath} already imports the Convex preset`
                : false
            },
            template: 'import { convex, sentry } from "{{envPackage}}/presets"',
            type: "modify",
          },
          {
            path: envPath,
            pattern: "  extends: [",
            skip: async () => {
              const contents = await Bun.file(envPath).text()
              return contents.includes("convex.expo()")
                ? `${envPath} already uses the Convex preset`
                : false
            },
            template: "  extends: [convex.expo(), ",
            type: "modify",
          },
          {
            path: envPath,
            pattern: "createEnv({",
            skip: async () => {
              const contents = await Bun.file(envPath).text()
              return contents.includes("export default createEnv")
                ? `${envPath} already has a default export`
                : false
            },
            template: "export default createEnv({",
            type: "modify",
          },
          {
            path: "apps/mobile/.env.template",
            pattern: /$/,
            separator: "\n",
            skip: async () => {
              const contents = await Bun.file("apps/mobile/.env.template").text()
              return contents.includes("EXPO_PUBLIC_CONVEX_URL=")
                ? "apps/mobile/.env.template already contains Convex variables"
                : false
            },
            templateFile: "templates/backend-clients/convex/mobile/env.hbs",
            type: "append",
            unique: false,
          },
          {
            path: providersPath,
            pattern: 'import type { PropsWithChildren } from "react"',
            skip: async () => {
              const contents = await Bun.file(providersPath).text()
              return contents.includes('from "#shared/components/convex-provider.tsx"')
                ? `${providersPath} already imports ConvexProvider`
                : false
            },
            template:
              'import ConvexProvider from "#shared/components/convex-provider.tsx"\nimport type { PropsWithChildren } from "react"',
            type: "modify",
          },
          {
            path: providersPath,
            pattern: "  return (\n    <PersistQueryClientProvider",
            skip: async () => {
              const contents = await Bun.file(providersPath).text()
              return contents.includes("<ConvexProvider>")
                ? `${providersPath} already opens ConvexProvider`
                : false
            },
            template: "  return (\n    <ConvexProvider>\n      <PersistQueryClientProvider",
            type: "modify",
          },
          {
            path: providersPath,
            pattern: "    </PersistQueryClientProvider>\n  )",
            skip: async () => {
              const contents = await Bun.file(providersPath).text()
              return contents.includes("</ConvexProvider>")
                ? `${providersPath} already closes ConvexProvider`
                : false
            },
            template: "      </PersistQueryClientProvider>\n    </ConvexProvider>\n  )",
            type: "modify",
          },
          {
            path: "apps/mobile/src/app/(auth)/_layout.tsx",
            skipIfExists: true,
            templateFile: "templates/backend-clients/shared/mobile-auth/_layout.tsx.hbs",
            type: "add",
          },
          {
            path: "apps/mobile/src/app/(auth)/(unauthenticated)/sign-in.tsx",
            skipIfExists: true,
            templateFile: "templates/backend-clients/shared/mobile-auth/sign-in.tsx.hbs",
            type: "add",
          }
        )

        if (answers.example) {
          actions.push({
            path: "apps/mobile/src/app/(auth)/(authenticated)/convex-example.tsx",
            skipIfExists: true,
            templateFile: "templates/backend-clients/convex/mobile/example.tsx.hbs",
            type: "add",
          })
        } else {
          actions.push({
            path: "apps/mobile/src/app/(auth)/(authenticated)/index.tsx",
            skip: async () =>
              (await Bun.file(
                "apps/mobile/src/app/(auth)/(authenticated)/convex-example.tsx"
              ).exists())
                ? "The Convex example already provides an authenticated screen"
                : false,
            skipIfExists: true,
            templateFile: "templates/backend-clients/shared/mobile-auth/index.tsx.hbs",
            type: "add",
          })
        }
      }

      if (answers.backend === "hono") {
        const envPath = `${appPath}/src/shared/env.ts`
        const envKey = answers.app === "mobile" ? "EXPO_PUBLIC_API_URL" : "PUBLIC_API_URL"

        actions.push({
          path: `${appPath}/src/shared/api.ts`,
          skipIfExists: true,
          templateFile: "templates/backend-clients/hono/api.ts.hbs",
          type: "add",
        })

        if (answers.app === "app") {
          actions.push({
            path: "apps/app/.env.template",
            pattern: /$/,
            separator: "\n",
            skip: async () => {
              const contents = await Bun.file("apps/app/.env.template").text()
              return contents.includes("PUBLIC_API_URL=")
                ? "apps/app/.env.template already contains PUBLIC_API_URL"
                : false
            },
            templateFile: "templates/backend-clients/hono/app/env.hbs",
            type: "append",
            unique: false,
          })
        } else {
          const presetName = answers.app === "desktop" ? "tauri" : "sentry"
          const presetPattern =
            answers.app === "desktop"
              ? /import \{ tauri \} from "[^"]+\/presets"/
              : /import \{ sentry \} from "[^"]+\/presets"/

          actions.push(
            {
              path: envPath,
              pattern: presetPattern,
              skip: async () => {
                const contents = await Bun.file(envPath).text()
                return contents.includes('import * as z from "')
                  ? `${envPath} already imports the schema package`
                  : false
              },
              template: `import { ${presetName} } from "{{envPackage}}/presets"\nimport * as z from "{{utilsPackage}}/schema"`,
              type: "modify",
            },
            {
              path: envPath,
              pattern: "  client: {},",
              skip: async () => {
                const contents = await Bun.file(envPath).text()
                return contents.includes(`${envKey}:`)
                  ? `${envPath} already contains ${envKey}`
                  : false
              },
              template: `  client: {\n    ${envKey}: z.url(),\n  },`,
              type: "modify",
            }
          )

          if (answers.app === "mobile") {
            actions.push({
              path: envPath,
              pattern: "createEnv({",
              skip: async () => {
                const contents = await Bun.file(envPath).text()
                return contents.includes("export default createEnv")
                  ? `${envPath} already has a default export`
                  : false
              },
              template: "export default createEnv({",
              type: "modify",
            })
          }

          actions.push(
            {
              path: `${appPath}/src/shared/utils.ts`,
              skipIfExists: true,
              templateFile: `templates/backend-clients/hono/${answers.app}/utils.ts.hbs`,
              type: "add",
            },
            {
              path: `${appPath}/.env.template`,
              pattern: /$/,
              separator: "\n",
              skip: async () => {
                const contents = await Bun.file(`${appPath}/.env.template`).text()
                return contents.includes(`${envKey}=`)
                  ? `${appPath}/.env.template already contains ${envKey}`
                  : false
              },
              templateFile: `templates/backend-clients/hono/${answers.app}/env.hbs`,
              type: "append",
              unique: false,
            }
          )
        }

        if (answers.auth && answers.app === "app") {
          actions.push(
            "Auth uses apps/app's existing auth client. PUBLIC_API_URL selects apps/api; removing it restores the local /api/auth handler."
          )
        }

        if (answers.auth && answers.app === "mobile") {
          actions.push(
            {
              path: "apps/mobile/src/shared/auth.ts",
              skipIfExists: true,
              templateFile: "templates/backend-clients/hono/mobile/auth.ts.hbs",
              type: "add",
            },
            {
              path: "apps/mobile/src/app/(auth)/_layout.tsx",
              skipIfExists: true,
              templateFile: "templates/backend-clients/shared/mobile-auth/_layout.tsx.hbs",
              type: "add",
            },
            {
              path: "apps/mobile/src/app/(auth)/(unauthenticated)/sign-in.tsx",
              skipIfExists: true,
              templateFile: "templates/backend-clients/shared/mobile-auth/sign-in.tsx.hbs",
              type: "add",
            }
          )

          if (!answers.example) {
            actions.push({
              path: "apps/mobile/src/app/(auth)/(authenticated)/index.tsx",
              skip: async () =>
                (await Bun.file(
                  "apps/mobile/src/app/(auth)/(authenticated)/backend-example.tsx"
                ).exists())
                  ? "The backend example already provides an authenticated screen"
                  : false,
              skipIfExists: true,
              templateFile: "templates/backend-clients/shared/mobile-auth/index.tsx.hbs",
              type: "add",
            })
          }
        }

        if (answers.example) {
          const examplePath =
            answers.app === "mobile"
              ? answers.auth
                ? "apps/mobile/src/app/(auth)/(authenticated)/backend-example.tsx"
                : "apps/mobile/src/app/backend-example.tsx"
              : `${appPath}/src/routes/backend-example.tsx`

          actions.push({
            path: examplePath,
            skipIfExists: true,
            templateFile: `templates/backend-clients/hono/${answers.app}/example.tsx.hbs`,
            type: "add",
          })

          if (answers.app !== "mobile") {
            actions.push(async () => {
              const generateRoutes =
                'import { resolveConfig } from "vite"; await resolveConfig({}, "build")'
              await Bun.$`cd ${appPath} && CI=1 bun --eval ${generateRoutes}`
              return `${appPath}/src/routeTree.gen.ts regenerated`
            })
          }
        }
      }

      if (answers.backend === "trpc") {
        const providersPath = `${appPath}/src/shared/components/providers.tsx`

        actions.push({
          path: `${appPath}/src/shared/trpc.tsx`,
          skipIfExists: true,
          templateFile: `templates/backend-clients/trpc/${answers.app}/trpc.tsx.hbs`,
          type: "add",
        })

        if (answers.app === "app") {
          actions.push({
            path: "apps/app/.env.template",
            pattern: /$/,
            separator: "\n",
            skip: async () => {
              const contents = await Bun.file("apps/app/.env.template").text()
              return contents.includes("PUBLIC_API_URL=")
                ? "apps/app/.env.template already contains PUBLIC_API_URL"
                : false
            },
            templateFile: "templates/backend-clients/hono/app/env.hbs",
            type: "append",
            unique: false,
          })
        } else {
          const envPath = "apps/desktop/src/shared/env.ts"

          actions.push(
            {
              path: envPath,
              pattern: /import \{ tauri \} from "[^"]+\/presets"/,
              skip: async () => {
                const contents = await Bun.file(envPath).text()
                return contents.includes('import * as z from "')
                  ? `${envPath} already imports the schema package`
                  : false
              },
              template:
                'import { tauri } from "{{envPackage}}/presets"\nimport * as z from "{{utilsPackage}}/schema"',
              type: "modify",
            },
            {
              path: envPath,
              pattern: "  client: {},",
              skip: async () => {
                const contents = await Bun.file(envPath).text()
                return contents.includes("PUBLIC_API_URL:")
                  ? `${envPath} already contains PUBLIC_API_URL`
                  : false
              },
              template: "  client: {\n    PUBLIC_API_URL: z.url(),\n  },",
              type: "modify",
            },
            {
              path: "apps/desktop/src/shared/utils.ts",
              skipIfExists: true,
              templateFile: "templates/backend-clients/hono/desktop/utils.ts.hbs",
              type: "add",
            },
            {
              path: "apps/desktop/.env.template",
              pattern: /$/,
              separator: "\n",
              skip: async () => {
                const contents = await Bun.file("apps/desktop/.env.template").text()
                return contents.includes("PUBLIC_API_URL=")
                  ? "apps/desktop/.env.template already contains PUBLIC_API_URL"
                  : false
              },
              templateFile: "templates/backend-clients/hono/desktop/env.hbs",
              type: "append",
              unique: false,
            }
          )
        }

        if (answers.app === "app") {
          actions.push(
            {
              path: providersPath,
              pattern: 'import type { ReactNode } from "react"',
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes('from "#shared/trpc.tsx"')
                  ? `${providersPath} already imports TRPCProvider`
                  : false
              },
              template:
                'import { TRPCProvider } from "#shared/trpc.tsx"\nimport type { ReactNode } from "react"',
              type: "modify",
            },
            {
              path: providersPath,
              pattern: "  return (\n    <ThemeProvider",
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes("<TRPCProvider>")
                  ? `${providersPath} already opens TRPCProvider`
                  : false
              },
              template: "  return (\n    <TRPCProvider>\n      <ThemeProvider",
              type: "modify",
            },
            {
              path: providersPath,
              pattern: "    </ThemeProvider>\n  )",
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes("</TRPCProvider>")
                  ? `${providersPath} already closes TRPCProvider`
                  : false
              },
              template: "      </ThemeProvider>\n    </TRPCProvider>\n  )",
              type: "modify",
            }
          )
        } else {
          actions.push(
            {
              path: providersPath,
              pattern: 'import type { PropsWithChildren } from "react"',
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes('from "#shared/trpc.tsx"')
                  ? `${providersPath} already imports TRPCProvider`
                  : false
              },
              template:
                'import { TRPCProvider } from "#shared/trpc.tsx"\nimport type { PropsWithChildren } from "react"',
              type: "modify",
            },
            {
              path: providersPath,
              pattern: "  return (\n    <QueryClientProvider client={queryClient}>",
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes("<TRPCProvider>")
                  ? `${providersPath} already opens TRPCProvider`
                  : false
              },
              template:
                "  return (\n    <QueryClientProvider client={queryClient}>\n      <TRPCProvider>",
              type: "modify",
            },
            {
              path: providersPath,
              pattern: "    </QueryClientProvider>\n  )",
              skip: async () => {
                const contents = await Bun.file(providersPath).text()
                return contents.includes("</TRPCProvider>")
                  ? `${providersPath} already closes TRPCProvider`
                  : false
              },
              template: "      </TRPCProvider>\n    </QueryClientProvider>\n  )",
              type: "modify",
            }
          )
        }

        if (answers.auth && answers.app === "app") {
          actions.push(
            "Auth uses apps/app's existing auth client through PUBLIC_API_URL. The local handler remains available when the variable is removed."
          )
        }

        if (answers.example) {
          actions.push(
            {
              path: `${appPath}/src/routes/trpc-example.tsx`,
              skipIfExists: true,
              templateFile: `templates/backend-clients/trpc/${answers.app}/example.tsx.hbs`,
              type: "add",
            },
            async () => {
              const generateRoutes =
                'import { resolveConfig } from "vite"; await resolveConfig({}, "build")'
              await Bun.$`cd ${appPath} && CI=1 bun --eval ${generateRoutes}`
              return `${appPath}/src/routeTree.gen.ts regenerated`
            }
          )
        }
      }

      actions.push(
        async () => {
          if (answers.backend === "trpc") {
            const packageJson = (await Bun.file(`${appPath}/package.json`).json()) as PackageJson
            const installedPackages = {
              ...packageJson.dependencies,
              ...packageJson.devDependencies,
            }
            const missingPackages = [
              "@tanstack/react-query",
              "@trpc/client",
              "@trpc/tanstack-react-query",
              "superjson",
            ].filter((packageName) => !(packageName in installedPackages))

            if (missingPackages.length > 0) {
              await Bun.$`cd ${appPath} && bun add --exact ${missingPackages}`
              return `${appPath}: installed ${missingPackages.join(", ")}`
            }
          }

          if (answers.workspaceDependenciesChanged) {
            await Bun.$`bun install`
            return `${appPath}: workspace dependencies installed`
          }

          return `[SKIPPED] ${appPath}: dependencies already installed`
        },
        async () => {
          const generatedPaths = [
            `${appPath}/package.json`,
            `${appPath}/src/shared/api.ts`,
            `${appPath}/src/shared/auth.ts`,
            `${appPath}/src/shared/components/convex-provider.tsx`,
            `${appPath}/src/shared/components/providers.tsx`,
            `${appPath}/src/shared/env.ts`,
            `${appPath}/src/shared/trpc.tsx`,
            `${appPath}/src/shared/utils.ts`,
            `${appPath}/src/app/(auth)/_layout.tsx`,
            `${appPath}/src/app/(auth)/(authenticated)/index.tsx`,
            `${appPath}/src/app/(auth)/(authenticated)/backend-example.tsx`,
            `${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`,
            `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`,
            `${appPath}/src/app/backend-example.tsx`,
            `${appPath}/src/routes/backend-example.tsx`,
            `${appPath}/src/routes/trpc-example.tsx`,
            `${appPath}/src/routeTree.gen.ts`,
          ]
          const checkedPaths = await Promise.all(
            generatedPaths.map(async (path) => ((await Bun.file(path).exists()) ? path : undefined))
          )
          const existingPaths = checkedPaths.filter((path): path is string => path !== undefined)

          await Bun.$`bun run format -- ${existingPaths}`
          return `Connected apps/${answers.app} to ${answers.backend}`
        }
      )

      return actions
    },
    description: "Connect an app to a maintained backend",
    prompts: [
      {
        choices:
          apps.length > 0
            ? apps.map((app) => ({ name: app, value: app }))
            : [{ name: "No apps found", value: "" }],
        message: "Which app would you like to connect?",
        name: "app",
        type: "list",
      },
      {
        choices: ["convex", "hono", "trpc"],
        message: "Which backend would you like to connect?",
        name: "backend",
        type: "list",
      },
      {
        default: false,
        message: "Include auth client wiring?",
        name: "auth",
        type: "confirm",
      },
      {
        default: false,
        message: "Would you like an example showing how to use this backend?",
        name: "example",
        type: "confirm",
      },
    ],
  })
}
