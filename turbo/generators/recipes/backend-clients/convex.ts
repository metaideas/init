import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"
import type { BackendAdapter, ConnectBackendAnswers } from "./types"
import { fileContains, getAddAction, skipWhenFileContains } from "../../shared/utils"
import {
  ensureBackendWorkspace,
  ensureBaseApp,
  ensureFileContains,
  ensureFileMatches,
  ensureGeneratedFileIsCompatible,
  getAppendAction,
  getFormatAction,
  getInstallAction,
  getSummaryAction,
  getWorkspaceDependencyAction,
  hasDependency,
} from "./shared"

const appPath = "apps/mobile"
const providersPath = `${appPath}/src/shared/components/providers.tsx`
const providerImportAnchor = 'import type { PropsWithChildren } from "react"'
const providerStartAnchor = "  return (\n    <PersistQueryClientProvider"
const providerEndAnchor = "    </PersistQueryClientProvider>\n  )"
const templatePath = "templates/backend-clients/convex/mobile"
const presetImportPattern = /import \{ sentry \} from "[^"]+\/presets"/

async function preflight(answers: ConnectBackendAnswers): Promise<void> {
  await ensureBaseApp(answers)
  await ensureBackendWorkspace(answers)
  const envPath = `${appPath}/src/shared/env.ts`
  if (!(await fileContains(envPath, "import { convex, sentry }"))) {
    await ensureFileMatches(envPath, presetImportPattern, "The mobile environment import seam")
  }
  if (!(await fileContains(envPath, "convex.expo()"))) {
    await ensureFileContains(envPath, "  extends: [", "The mobile environment preset seam")
  }
  if (!(await fileContains(envPath, "export default createEnv"))) {
    await ensureFileContains(envPath, "createEnv({", "The mobile environment default export seam")
  }
  if (!(await fileContains(providersPath, 'from "#shared/components/convex-provider.tsx"'))) {
    await ensureFileContains(providersPath, providerImportAnchor, "The mobile provider seam")
  }
  if (!(await fileContains(providersPath, "<ConvexProvider>"))) {
    await ensureFileContains(providersPath, providerStartAnchor, "The mobile provider seam")
  }
  if (!(await fileContains(providersPath, "</ConvexProvider>"))) {
    await ensureFileContains(providersPath, providerEndAnchor, "The mobile provider seam")
  }
  await ensureGeneratedFileIsCompatible(`${appPath}/src/shared/auth.ts`, "convexClient()")
  await ensureGeneratedFileIsCompatible(
    `${appPath}/src/shared/components/convex-provider.tsx`,
    "convexQueryClient.connect(queryClient)"
  )

  const backendPackage = answers.backendPackage
  const authPackage = answers.authPackage
  if (!backendPackage || !authPackage) throw new Error("Package discovery failed")

  const expectedFiles = [
    `${appPath}/src/shared/auth.ts`,
    `${appPath}/src/shared/components/convex-provider.tsx`,
    `${appPath}/src/app/(auth)/_layout.tsx`,
    `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`,
  ]
  if (answers.example) {
    expectedFiles.push(`${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`)
  } else {
    const hasAuthenticatedScreen =
      (await Bun.file(`${appPath}/src/app/(auth)/(authenticated)/index.tsx`).exists()) ||
      (await Bun.file(`${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`).exists())
    if (!hasAuthenticatedScreen) {
      expectedFiles.push(`${appPath}/src/app/(auth)/(authenticated)/index.tsx`)
    }
  }

  const fileChecks = await Promise.all(
    expectedFiles.map(async (path) => !(await Bun.file(path).exists()))
  )
  const filesMissing = fileChecks.some(Boolean)
  const packageMissing =
    !(await hasDependency(appPath, backendPackage)) || !(await hasDependency(appPath, authPackage))

  const hasPlannedChanges =
    filesMissing ||
    packageMissing ||
    !(await fileContains(`${appPath}/src/shared/env.ts`, "convex.expo()")) ||
    !(await fileContains(`${appPath}/src/shared/env.ts`, "export default createEnv")) ||
    !(await fileContains(providersPath, "<ConvexProvider>")) ||
    !(await fileContains(`${appPath}/.env.template`, "EXPO_PUBLIC_CONVEX_URL="))

  Object.assign(answers, { _hasPlannedChanges: hasPlannedChanges })
}

function getActions(answers: ConnectBackendAnswers): PlopTypes.ActionType[] {
  const actions: PlopTypes.ActionType[] = [
    getWorkspaceDependencyAction(appPath, ["packages/auth", "packages/backend"]),
    getAddAction(
      `${appPath}/src/shared/components/convex-provider.tsx`,
      `${templatePath}/convex-provider.tsx.hbs`
    ),
    getAddAction(`${appPath}/src/shared/auth.ts`, `${templatePath}/auth.ts.hbs`),
    {
      path: `${appPath}/src/shared/env.ts`,
      pattern: presetImportPattern,
      skip: skipWhenFileContains(
        `${appPath}/src/shared/env.ts`,
        "import { convex, sentry }",
        `${appPath}/src/shared/env.ts preset import`
      ),
      template: 'import { convex, sentry } from "{{envPackage}}/presets"',
      type: "modify",
    },
    {
      path: `${appPath}/src/shared/env.ts`,
      pattern: "  extends: [",
      skip: skipWhenFileContains(
        `${appPath}/src/shared/env.ts`,
        "convex.expo()",
        `${appPath}/src/shared/env.ts Convex preset`
      ),
      template: "  extends: [convex.expo(), ",
      type: "modify",
    },
    {
      path: `${appPath}/src/shared/env.ts`,
      pattern: "createEnv({",
      skip: skipWhenFileContains(
        `${appPath}/src/shared/env.ts`,
        "export default createEnv",
        `${appPath}/src/shared/env.ts default export`
      ),
      template: "export default createEnv({",
      type: "modify",
    },
    getAppendAction(
      `${appPath}/.env.template`,
      `${templatePath}/env.hbs`,
      "EXPO_PUBLIC_CONVEX_URL="
    ),
    {
      path: providersPath,
      pattern: providerImportAnchor,
      skip: skipWhenFileContains(
        providersPath,
        'from "#shared/components/convex-provider.tsx"',
        `${providersPath} Convex import`
      ),
      template: `import ConvexProvider from "#shared/components/convex-provider.tsx"\n${providerImportAnchor}`,
      type: "modify",
    },
    {
      path: providersPath,
      pattern: providerStartAnchor,
      skip: skipWhenFileContains(
        providersPath,
        "<ConvexProvider>",
        `${providersPath} Convex provider opening`
      ),
      template: "  return (\n    <ConvexProvider>\n      <PersistQueryClientProvider",
      type: "modify",
    },
    {
      path: providersPath,
      pattern: providerEndAnchor,
      skip: skipWhenFileContains(
        providersPath,
        "</ConvexProvider>",
        `${providersPath} Convex provider closing`
      ),
      template: "      </PersistQueryClientProvider>\n    </ConvexProvider>\n  )",
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

  return [
    ...actions,
    answers.example
      ? getAddAction(
          `${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`,
          `${templatePath}/example.tsx.hbs`
        )
      : {
          ...getAddAction(
            `${appPath}/src/app/(auth)/(authenticated)/index.tsx`,
            "templates/backend-clients/shared/mobile-auth/index.tsx.hbs"
          ),
          skip: async () =>
            (await Bun.file(
              `${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`
            ).exists())
              ? `${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx already provides an authenticated screen`
              : false,
        },
    getInstallAction(appPath),
    getFormatAction([
      `${appPath}/src/shared/components/convex-provider.tsx`,
      `${appPath}/src/shared/auth.ts`,
      `${appPath}/src/shared/env.ts`,
      providersPath,
      `${appPath}/src/app/(auth)/_layout.tsx`,
      `${appPath}/src/app/(auth)/(unauthenticated)/sign-in.tsx`,
      `${appPath}/src/app/(auth)/(authenticated)/index.tsx`,
      `${appPath}/src/app/(auth)/(authenticated)/convex-example.tsx`,
    ]),
    getSummaryAction(),
  ]
}

export const convexMobileAdapter: BackendAdapter = { getActions, preflight }
