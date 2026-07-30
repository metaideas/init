import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"
import type { BackendAdapter, ConnectBackendAnswers, SupportedApp } from "./types"
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

const externalPackages: string[] = []
const templateRoot = "templates/backend-clients/hono"

function getPresetImportPattern(app: Exclude<SupportedApp, "app">) {
  const presetName = app === "desktop" ? "tauri" : "sentry"
  return new RegExp(`import \\{ ${presetName} \\} from "[^"]+/presets"`)
}

function getEnvKey(app: SupportedApp) {
  return app === "mobile" ? "EXPO_PUBLIC_API_URL" : "PUBLIC_API_URL"
}

function getExamplePath(answers: ConnectBackendAnswers) {
  if (answers.app !== "mobile") {
    return `apps/${answers.app}/src/routes/backend-example.tsx`
  }

  return answers.auth
    ? "apps/mobile/src/app/(auth)/(authenticated)/backend-example.tsx"
    : "apps/mobile/src/app/backend-example.tsx"
}

async function preflight(answers: ConnectBackendAnswers): Promise<void> {
  await ensureBaseApp(answers)
  await ensureApiWorkspace(answers)

  const appPath = `apps/${answers.app}`
  const envPath = `${appPath}/src/shared/env.ts`
  const utilsPath = `${appPath}/src/shared/utils.ts`

  if (answers.auth && answers.app === "desktop") {
    throw new Error(
      "Desktop auth wiring is not supported until the generated client has a user-facing consumer."
    )
  }

  if (answers.auth && answers.app === "mobile") {
    const authPath = `${appPath}/src/shared/auth.ts`
    await ensureGeneratedFileIsCompatible(authPath, 'buildApiUrl("/auth")')
    if (
      (await Bun.file(authPath).exists()) &&
      !(await fileContains(authPath, "export function getAuthHeaders"))
    ) {
      await ensureFileContains(
        authPath,
        "export const { useSession } = auth",
        "The mobile Hono auth header helper seam"
      )
    }

    const apiPath = `${appPath}/src/shared/api.ts`
    if (await Bun.file(apiPath).exists()) {
      if (!(await fileContains(apiPath, 'from "#shared/auth.ts"'))) {
        await ensureFileContains(
          apiPath,
          'import { buildApiUrl } from "#shared/utils.ts"',
          "The mobile Hono auth header import seam"
        )
      }
      if (!(await fileContains(apiPath, "headers: getAuthHeaders"))) {
        await ensureFileContains(
          apiPath,
          'export const api = createClient(buildApiUrl("/"))',
          "The mobile Hono auth header client seam"
        )
      }
    }
  }

  if (answers.app !== "app") {
    const envKey = getEnvKey(answers.app)
    if (!(await fileContains(envPath, 'import * as z from "'))) {
      await ensureFileMatches(
        envPath,
        getPresetImportPattern(answers.app),
        "The environment preset import seam"
      )
    }
    if (!(await fileContains(envPath, `${envKey}:`))) {
      await ensureFileContains(envPath, "  client: {},", "The environment client schema seam")
    }
    if (answers.app === "mobile" && !(await fileContains(envPath, "export default createEnv"))) {
      await ensureFileContains(envPath, "createEnv({", "The environment default export seam")
    }
    await ensureGeneratedFileIsCompatible(utilsPath, "export const buildApiUrl")
  }

  if (answers.auth && answers.app === "mobile") {
    await ensureGeneratedFileIsCompatible(
      `${appPath}/src/app/(auth)/_layout.tsx`,
      "Stack.Protected"
    )
  }

  const apiPackage = answers.apiPackage
  if (!apiPackage) throw new Error("API package discovery failed")

  const expectedFiles = [`${appPath}/src/shared/api.ts`]
  if (answers.app !== "app") expectedFiles.push(utilsPath)
  if (answers.auth && answers.app === "mobile") {
    expectedFiles.push(`${appPath}/src/shared/auth.ts`)
  }
  if (answers.auth && answers.app === "mobile") {
    expectedFiles.push(
      `${appPath}/src/app/(auth)/_layout.tsx`,
      `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`
    )
    if (!answers.example) {
      const hasAuthenticatedScreen =
        (await Bun.file(`${appPath}/src/app/(auth)/(authenticated)/index.tsx`).exists()) ||
        (await Bun.file(`${appPath}/src/app/(auth)/(authenticated)/backend-example.tsx`).exists())
      if (!hasAuthenticatedScreen) {
        expectedFiles.push(`${appPath}/src/app/(auth)/(authenticated)/index.tsx`)
      }
    }
  }
  if (answers.example) expectedFiles.push(getExamplePath(answers))

  const authPackageMissing =
    answers.auth &&
    answers.app === "mobile" &&
    answers.authPackage !== undefined &&
    !(await hasDependency(appPath, answers.authPackage))

  const fileChecks = await Promise.all(
    expectedFiles.map(async (path) => !(await Bun.file(path).exists()))
  )
  const hasPlannedChanges =
    fileChecks.some(Boolean) ||
    !(await hasDependency(appPath, apiPackage)) ||
    authPackageMissing ||
    !(await fileContains(`${appPath}/.env.template`, `${getEnvKey(answers.app)}=`)) ||
    (answers.app !== "app" && !(await fileContains(envPath, `${getEnvKey(answers.app)}:`))) ||
    (answers.app === "mobile" && !(await fileContains(envPath, "export default createEnv"))) ||
    (answers.auth &&
      answers.app === "mobile" &&
      (!(await fileContains(`${appPath}/src/shared/auth.ts`, "export function getAuthHeaders")) ||
        !(await fileContains(`${appPath}/src/shared/api.ts`, "headers: getAuthHeaders"))))

  Object.assign(answers, { _hasPlannedChanges: hasPlannedChanges })
}

function getEnvironmentActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  const { app } = answers
  const appPath = `apps/${app}`
  const envPath = `${appPath}/src/shared/env.ts`
  const utilsPath = `${appPath}/src/shared/utils.ts`
  const envKey = getEnvKey(app)

  if (app === "app") {
    return [
      getAppendAction(`${appPath}/.env.template`, `${templateRoot}/app/env.hbs`, `${envKey}=`),
    ]
  }

  const presetName = app === "desktop" ? "tauri" : "sentry"
  const presetImportPattern = getPresetImportPattern(app)

  const defaultExportActions: PlopTypes.ActionType[] =
    app === "mobile"
      ? [
          {
            path: envPath,
            pattern: "createEnv({",
            skip: skipWhenFileContains(
              envPath,
              "export default createEnv",
              `${envPath} default export`
            ),
            template: "export default createEnv({",
            type: "modify",
          },
        ]
      : []

  return [
    {
      path: envPath,
      pattern: presetImportPattern,
      skip: skipWhenFileContains(envPath, 'import * as z from "', `${envPath} schema import`),
      template: `import { ${presetName} } from "{{envPackage}}/presets"\nimport * as z from "{{utilsPackage}}/schema"`,
      type: "modify",
    },
    {
      path: envPath,
      pattern: "  client: {},",
      skip: skipWhenFileContains(envPath, `${envKey}:`, `${envPath} ${envKey} schema`),
      template: `  client: {\n    ${envKey}: z.url(),\n  },`,
      type: "modify",
    },
    ...defaultExportActions,
    getAddAction(utilsPath, `${templateRoot}/${app}/utils.ts.hbs`),
    getAppendAction(`${appPath}/.env.template`, `${templateRoot}/${app}/env.hbs`, `${envKey}=`),
  ]
}

function getAuthActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  if (!answers.auth) return []
  if (answers.app === "app") {
    return [
      "Auth uses apps/app's existing auth client. PUBLIC_API_URL selects apps/api; removing it restores the local /api/auth handler. Keep Better Auth cookies, secrets, plugins, and trusted origins compatible across both deployments.",
    ]
  }

  if (answers.app === "desktop") return []

  const appPath = "apps/mobile"
  const authPath = `${appPath}/src/shared/auth.ts`
  const actions: PlopTypes.ActionType[] = [
    getAddAction(authPath, `${templateRoot}/mobile/auth.ts.hbs`),
    {
      path: authPath,
      pattern: "export const { useSession } = auth",
      skip: skipWhenFileContains(
        authPath,
        "export function getAuthHeaders",
        `${authPath} auth header helper`
      ),
      template:
        "export const { useSession } = auth\n\nexport function getAuthHeaders() {\n  const cookie = auth.getCookie()\n  return cookie ? { Cookie: cookie } : {}\n}",
      type: "modify",
    },
    getAddAction(
      `${appPath}/src/app/(auth)/_layout.tsx`,
      "templates/backend-clients/shared/mobile-auth/_layout.tsx.hbs"
    ),
    getAddAction(
      `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`,
      "templates/backend-clients/shared/mobile-auth/sign-in.tsx.hbs"
    ),
  ]

  if (!answers.example) {
    actions.push({
      ...getAddAction(
        `${appPath}/src/app/(auth)/(authenticated)/index.tsx`,
        "templates/backend-clients/shared/mobile-auth/index.tsx.hbs"
      ),
      skip: async () =>
        (await Bun.file(`${appPath}/src/app/(auth)/(authenticated)/backend-example.tsx`).exists())
          ? `${appPath}/src/app/(auth)/(authenticated)/backend-example.tsx already provides an authenticated screen`
          : false,
    })
  }

  return actions
}

function getFormatPaths(answers: ConnectBackendAnswers): string[] {
  const appPath = `apps/${answers.app}`
  const paths = [`${appPath}/src/shared/api.ts`]

  if (answers.app !== "app") {
    paths.push(`${appPath}/src/shared/env.ts`, `${appPath}/src/shared/utils.ts`)
  }
  if (answers.auth && answers.app === "mobile") {
    paths.push(
      `${appPath}/src/shared/auth.ts`,
      `${appPath}/src/app/(auth)/_layout.tsx`,
      `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`,
      `${appPath}/src/app/(auth)/(authenticated)/index.tsx`
    )
  }
  if (answers.example) paths.push(getExamplePath(answers))
  if (answers.example && answers.app !== "mobile") {
    paths.push(`${appPath}/src/routeTree.gen.ts`)
  }

  return paths
}

function getExampleActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  if (!answers.example) return []

  const actions: PlopTypes.ActionType[] = [
    getAddAction(getExamplePath(answers), `${templateRoot}/${answers.app}/example.tsx.hbs`),
  ]

  if (answers.app !== "mobile") {
    actions.push(getRouteTreeAction(`apps/${answers.app}`, "backend-example"))
  }

  return actions
}

function getApiActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  const apiPath = `apps/${answers.app}/src/shared/api.ts`
  const hasMobileAuth = answers.auth && answers.app === "mobile"
  const apiTemplate = hasMobileAuth
    ? `${templateRoot}/mobile/api.ts.hbs`
    : `${templateRoot}/api.ts.hbs`
  const actions: PlopTypes.ActionType[] = [getAddAction(apiPath, apiTemplate)]

  if (!hasMobileAuth) return actions

  return [
    ...actions,
    {
      path: apiPath,
      pattern: 'import { buildApiUrl } from "#shared/utils.ts"',
      skip: skipWhenFileContains(
        apiPath,
        'from "#shared/auth.ts"',
        `${apiPath} auth header import`
      ),
      template:
        'import { getAuthHeaders } from "#shared/auth.ts"\nimport { buildApiUrl } from "#shared/utils.ts"',
      type: "modify",
    },
    {
      path: apiPath,
      pattern: 'export const api = createClient(buildApiUrl("/"))',
      skip: skipWhenFileContains(
        apiPath,
        "headers: getAuthHeaders",
        `${apiPath} auth header configuration`
      ),
      template:
        'export const api = createClient(buildApiUrl("/"), {\n  headers: getAuthHeaders,\n})',
      type: "modify",
    },
  ]
}

function getActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  const appPath = `apps/${answers.app}`
  const workspacePaths = ["apps/api"]
  if (answers.auth && answers.app === "mobile") workspacePaths.push("packages/auth")

  return [
    getWorkspaceDependencyAction(appPath, workspacePaths),
    ...getApiActions(answers),
    ...getEnvironmentActions(answers),
    ...getAuthActions(answers),
    ...getExampleActions(answers),
    getInstallAction(appPath, externalPackages),
    getFormatAction(getFormatPaths(answers)),
    getSummaryAction(),
  ]
}

export const honoAdapter: BackendAdapter = { getActions, preflight }
