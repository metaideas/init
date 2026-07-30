import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"
import type { BackendAdapter, ConnectBackendAnswers } from "./types"
import { fileContains, getAddAction, skipWhenFileContains } from "../../shared/utils"
import {
  ensureApiWorkspace,
  ensureBaseApp,
  ensureFileContains,
  ensureFileMatches,
  ensureGeneratedFileIsCompatible,
  getAppendAction,
  getFormatAction,
  getInstallAction,
  getRouteTreeAction,
  getSummaryAction,
  getWorkspaceDependencyAction,
  hasDependency,
} from "./shared"

const externalPackages = [
  "@tanstack/react-query",
  "@trpc/client",
  "@trpc/tanstack-react-query",
  "superjson",
]
const templateRoot = "templates/backend-clients/trpc"
const desktopPresetImportPattern = /import \{ tauri \} from "[^"]+\/presets"/

type ProviderInsertion = {
  endAnchor: string
  endTemplate: string
  importAnchor: string
  startAnchor: string
  startTemplate: string
}

function getProviderInsertion(appPath: string): ProviderInsertion {
  if (appPath === "apps/app") {
    return {
      endAnchor: "    </ThemeProvider>\n  )",
      endTemplate: "      </ThemeProvider>\n    </TRPCProvider>\n  )",
      importAnchor: 'import type { ReactNode } from "react"',
      startAnchor: "  return (\n    <ThemeProvider",
      startTemplate: "  return (\n    <TRPCProvider>\n      <ThemeProvider",
    }
  }

  return {
    endAnchor: "    </QueryClientProvider>\n  )",
    endTemplate: "      </TRPCProvider>\n    </QueryClientProvider>\n  )",
    importAnchor: 'import type { PropsWithChildren } from "react"',
    startAnchor: "  return (\n    <QueryClientProvider client={queryClient}>",
    startTemplate:
      "  return (\n    <QueryClientProvider client={queryClient}>\n      <TRPCProvider>",
  }
}

async function preflight(answers: ConnectBackendAnswers): Promise<void> {
  await ensureBaseApp(answers)
  await ensureApiWorkspace(answers)

  const appPath = `apps/${answers.app}`
  const providersPath = `${appPath}/src/shared/components/providers.tsx`
  const providerInsertion = getProviderInsertion(appPath)

  if (!(await fileContains(providersPath, 'from "#shared/trpc.tsx"'))) {
    await ensureFileContains(providersPath, providerInsertion.importAnchor, "The provider seam")
  }
  if (!(await fileContains(providersPath, "<TRPCProvider>"))) {
    await ensureFileContains(providersPath, providerInsertion.startAnchor, "The provider seam")
  }
  if (!(await fileContains(providersPath, "</TRPCProvider>"))) {
    await ensureFileContains(providersPath, providerInsertion.endAnchor, "The provider seam")
  }

  if (answers.auth && answers.app === "desktop") {
    throw new Error(
      "Desktop auth wiring is not supported until the generated client has a user-facing consumer."
    )
  }

  if (answers.app === "desktop") {
    const envPath = `${appPath}/src/shared/env.ts`
    if (!(await fileContains(envPath, 'import * as z from "'))) {
      await ensureFileMatches(
        envPath,
        desktopPresetImportPattern,
        "The environment preset import seam"
      )
    }
    if (!(await fileContains(envPath, "PUBLIC_API_URL:"))) {
      await ensureFileContains(envPath, "  client: {},", "The environment client schema seam")
    }
    await ensureGeneratedFileIsCompatible(
      `${appPath}/src/shared/utils.ts`,
      "export const buildApiUrl"
    )
  }

  const apiPackage = answers.apiPackage
  if (!apiPackage) throw new Error("API package discovery failed")

  const expectedFiles = [`${appPath}/src/shared/trpc.tsx`]
  if (answers.app === "desktop") expectedFiles.push(`${appPath}/src/shared/utils.ts`)
  if (answers.example) expectedFiles.push(`${appPath}/src/routes/trpc-example.tsx`)

  const externalPackageChecks = await Promise.all(
    externalPackages.map((name) => hasDependency(appPath, name))
  )
  const externalMissing = externalPackageChecks.some((hasPackage) => !hasPackage)
  const fileChecks = await Promise.all(
    expectedFiles.map(async (path) => !(await Bun.file(path).exists()))
  )
  const hasPlannedChanges =
    fileChecks.some(Boolean) ||
    !(await hasDependency(appPath, apiPackage)) ||
    externalMissing ||
    !(await fileContains(providersPath, "<TRPCProvider>")) ||
    !(await fileContains(`${appPath}/.env.template`, "PUBLIC_API_URL=")) ||
    (answers.app === "desktop" &&
      !(await fileContains(`${appPath}/src/shared/env.ts`, "PUBLIC_API_URL:")))

  Object.assign(answers, { _hasPlannedChanges: hasPlannedChanges })
}

function getDesktopEnvironmentActions(): PlopTypes.ActionType[] {
  const envPath = "apps/desktop/src/shared/env.ts"

  return [
    {
      path: envPath,
      pattern: desktopPresetImportPattern,
      skip: skipWhenFileContains(envPath, 'import * as z from "', `${envPath} schema import`),
      template:
        'import { tauri } from "{{envPackage}}/presets"\nimport * as z from "{{utilsPackage}}/schema"',
      type: "modify",
    },
    {
      path: envPath,
      pattern: "  client: {},",
      skip: skipWhenFileContains(envPath, "PUBLIC_API_URL:", `${envPath} API URL schema`),
      template: "  client: {\n    PUBLIC_API_URL: z.url(),\n  },",
      type: "modify",
    },
    getAddAction(
      "apps/desktop/src/shared/utils.ts",
      "templates/backend-clients/hono/desktop/utils.ts.hbs"
    ),
    getAppendAction(
      "apps/desktop/.env.template",
      "templates/backend-clients/hono/desktop/env.hbs",
      "PUBLIC_API_URL="
    ),
  ]
}

function getProviderActions(appPath: string): PlopTypes.ActionType[] {
  const providersPath = `${appPath}/src/shared/components/providers.tsx`
  const providerInsertion = getProviderInsertion(appPath)

  return [
    {
      path: providersPath,
      pattern: providerInsertion.importAnchor,
      skip: skipWhenFileContains(
        providersPath,
        'from "#shared/trpc.tsx"',
        `${providersPath} tRPC import`
      ),
      template: `import { TRPCProvider } from "#shared/trpc.tsx"\n${providerInsertion.importAnchor}`,
      type: "modify",
    },
    {
      path: providersPath,
      pattern: providerInsertion.startAnchor,
      skip: skipWhenFileContains(
        providersPath,
        "<TRPCProvider>",
        `${providersPath} tRPC provider opening`
      ),
      template: providerInsertion.startTemplate,
      type: "modify",
    },
    {
      path: providersPath,
      pattern: providerInsertion.endAnchor,
      skip: skipWhenFileContains(
        providersPath,
        "</TRPCProvider>",
        `${providersPath} tRPC provider closing`
      ),
      template: providerInsertion.endTemplate,
      type: "modify",
    },
  ]
}

function getActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  const appPath = `apps/${answers.app}`
  const workspacePaths = ["apps/api"]

  const actions: PlopTypes.ActionType[] = [
    getWorkspaceDependencyAction(appPath, workspacePaths),
    getAddAction(`${appPath}/src/shared/trpc.tsx`, `${templateRoot}/${answers.app}/trpc.tsx.hbs`),
  ]

  if (answers.app === "app") {
    actions.push(
      getAppendAction(
        "apps/app/.env.template",
        "templates/backend-clients/hono/app/env.hbs",
        "PUBLIC_API_URL="
      )
    )
  } else {
    actions.push(...getDesktopEnvironmentActions())
  }

  actions.push(...getProviderActions(appPath))

  if (answers.auth && answers.app === "app") {
    actions.push(
      "Auth uses apps/app's existing auth client through PUBLIC_API_URL. The local Better Auth handler remains available when the variable is removed."
    )
  }

  if (answers.example) {
    actions.push(
      getAddAction(
        `${appPath}/src/routes/trpc-example.tsx`,
        `${templateRoot}/${answers.app}/example.tsx.hbs`
      ),
      getRouteTreeAction(appPath, "trpc-example")
    )
  }

  actions.push(
    getInstallAction(appPath, externalPackages),
    getFormatAction([
      `${appPath}/src/shared/trpc.tsx`,
      `${appPath}/src/shared/env.ts`,
      `${appPath}/src/shared/utils.ts`,
      `${appPath}/src/shared/components/providers.tsx`,
      `${appPath}/src/routes/trpc-example.tsx`,
      `${appPath}/src/routeTree.gen.ts`,
    ]),
    getSummaryAction()
  )

  return actions
}

export const trpcAdapter: BackendAdapter = { getActions, preflight }
