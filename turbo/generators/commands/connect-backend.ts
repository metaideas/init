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
  nativeUiPackage?: string
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
            const nativeUiPackageJson = (await Bun.file(
              "packages/native-ui/package.json"
            ).json()) as { name: string }

            answers.backendPackage = backendPackageJson.name
            answers.authPackage = authPackageJson.name
            answers.nativeUiPackage = nativeUiPackageJson.name
          } else {
            const apiPackageJson = (await Bun.file("apps/api/package.json").json()) as {
              name: string
            }
            answers.apiPackage = apiPackageJson.name

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
        },
        async () => addBackendEnvironment(appPath, answers.backend)
      )

      if (answers.backend === "convex") {
        const providersPath = "apps/mobile/src/shared/components/providers.tsx"

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
        actions.push({
          path: `${appPath}/src/shared/api.ts`,
          skipIfExists: true,
          templateFile: "templates/backend-clients/hono/api.ts.hbs",
          type: "add",
        })

        if (answers.app !== "app") {
          actions.push({
            path: `${appPath}/src/shared/utils.ts`,
            skipIfExists: true,
            templateFile: `templates/backend-clients/hono/${answers.app}/utils.ts.hbs`,
            type: "add",
          })
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

        if (answers.app !== "app") {
          actions.push({
            path: "apps/desktop/src/shared/utils.ts",
            skipIfExists: true,
            templateFile: "templates/backend-clients/hono/desktop/utils.ts.hbs",
            type: "add",
          })
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
            `${appPath}/.env.development`,
            `${appPath}/.env.schema`,
            `${appPath}/src/shared/api.ts`,
            `${appPath}/src/shared/auth.ts`,
            `${appPath}/src/shared/components/convex-provider.tsx`,
            `${appPath}/src/shared/components/providers.tsx`,
            `${appPath}/src/shared/env.generated.ts`,
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

          await Bun.$`cd ${appPath} && varlock codegen`
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

type EnvironmentEntry = {
  key: string
  schema: string
  developmentValue: string
}

const API_ENVIRONMENTS = {
  desktop: {
    developmentValue: "https://api.init.localhost",
    key: "PUBLIC_API_URL",
    schema: "# Remote API URL.\n# @public @type=url(matches=/^https?:\\/\\//)\nPUBLIC_API_URL=",
  },
  mobile: {
    developmentValue: "https://api.init.localhost",
    key: "EXPO_PUBLIC_API_URL",
    schema:
      "# Remote API URL.\n# @public @static @type=url(matches=/^https?:\\/\\//)\nEXPO_PUBLIC_API_URL=",
  },
} as const

const CONVEX_ENVIRONMENTS = [
  {
    developmentValue: "https://example.convex.site",
    key: "EXPO_PUBLIC_CONVEX_SITE_URL",
    schema: "# Convex HTTP action URL.\n# @public @static @type=url\nEXPO_PUBLIC_CONVEX_SITE_URL=",
  },
  {
    developmentValue: "https://example.convex.cloud",
    key: "EXPO_PUBLIC_CONVEX_URL",
    schema: "# Convex deployment URL.\n# @public @static @type=url\nEXPO_PUBLIC_CONVEX_URL=",
  },
] as const satisfies readonly EnvironmentEntry[]

export async function addBackendEnvironment(
  appPath: string,
  backend: ConnectBackendAnswers["backend"]
): Promise<string> {
  const entries =
    backend === "convex"
      ? CONVEX_ENVIRONMENTS
      : [API_ENVIRONMENTS[appPath === "apps/mobile" ? "mobile" : "desktop"]]

  const schemaPath = `${appPath}/.env.schema`
  const developmentPath = `${appPath}/.env.development`
  const schema = await Bun.file(schemaPath).text()
  const development = (await Bun.file(developmentPath).exists())
    ? await Bun.file(developmentPath).text()
    : ""
  const nextSchema = appendEnvironmentSchemaEntries(schema, entries)
  const nextDevelopment = appendEnvironmentValues(development, entries)

  if (nextSchema !== schema) await Bun.write(schemaPath, nextSchema)

  if (nextDevelopment !== development) await Bun.write(developmentPath, nextDevelopment)

  const addedKeys = entries
    .filter(({ key }) => !hasEnvironmentKey(schema, key) || !hasEnvironmentKey(development, key))
    .map(({ key }) => key)
  return addedKeys.length > 0
    ? `${appPath}: added ${addedKeys.join(", ")}`
    : `[SKIPPED] ${appPath} environment is already connected`
}

function appendEnvironmentSchemaEntries(
  contents: string,
  entries: readonly EnvironmentEntry[]
): string {
  const missingEntries = entries.filter(({ key }) => !hasEnvironmentKey(contents, key))
  if (missingEntries.length === 0) return contents

  return `${contents.trimEnd()}\n\n${missingEntries.map(({ schema }) => schema).join("\n\n")}\n`
}

function appendEnvironmentValues(contents: string, entries: readonly EnvironmentEntry[]): string {
  const missingEntries = entries.filter(({ key }) => !hasEnvironmentKey(contents, key))
  if (missingEntries.length === 0) return contents

  return `${contents.trimEnd()}${contents.trim() ? "\n" : ""}${missingEntries
    .map(({ developmentValue, key }) => `${key}=${developmentValue}`)
    .join("\n")}\n`
}

function hasEnvironmentKey(contents: string, key: string): boolean {
  return contents.split("\n").some((line) => line.startsWith(`${key}=`))
}
