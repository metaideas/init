import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"
import type { ConnectBackendAnswers } from "./types"
import {
  addWorkspaceDependencies,
  ensureWorkspaceExists,
  fileContains,
  installDependencies,
  readPackageName,
} from "../../shared/utils"

export async function ensureFileContains(
  path: string,
  content: string,
  description: string
): Promise<void> {
  await ensureFileMatches(path, content, description)
}

export async function ensureFileMatches(
  path: string,
  pattern: RegExp | string,
  description: string
): Promise<void> {
  const file = Bun.file(path)
  const fileContent = (await file.exists()) ? await file.text() : ""
  const hasMatch =
    typeof pattern === "string"
      ? fileContent.includes(pattern)
      : new RegExp(pattern.source, pattern.flags).test(fileContent)
  if (hasMatch) return

  throw new Error(
    `${description} is incompatible with this template snapshot: "${path}" is missing \`${pattern.toString()}\`.`
  )
}

export async function ensureGeneratedFileIsCompatible(
  path: string,
  expectedContent: string
): Promise<void> {
  const file = Bun.file(path)
  if (!(await file.exists()) || (await fileContains(path, expectedContent))) return

  throw new Error(
    `Cannot safely generate "${path}" because it already exists without the expected connection wiring.`
  )
}

export async function loadSharedPackageNames(answers: ConnectBackendAnswers): Promise<void> {
  const [authPackage, envPackage, nativeUiPackage, uiPackage, utilsPackage] = await Promise.all([
    readPackageName("packages/auth"),
    readPackageName("packages/env"),
    readPackageName("packages/native-ui"),
    readPackageName("packages/ui"),
    readPackageName("packages/utils"),
  ])

  Object.assign(answers, {
    authPackage,
    envPackage,
    nativeUiPackage,
    uiPackage,
    utilsPackage,
  })
}

export function getWorkspaceDependencyAction(
  appPath: string,
  workspacePaths: string[]
): PlopTypes.CustomActionFunction {
  return async (answers) => {
    const packageNames = await Promise.all(
      workspacePaths.map((workspacePath) => readPackageName(workspacePath))
    )
    const hasChanges = await addWorkspaceDependencies(appPath, packageNames)
    Object.assign(answers, { _workspaceDependenciesChanged: hasChanges })

    return hasChanges
      ? `${appPath}/package.json: added ${packageNames.join(", ")}`
      : `[SKIPPED] ${appPath}/package.json already contains ${packageNames.join(", ")}`
  }
}

export function getInstallAction(
  appPath: string,
  externalPackages: string[] = []
): PlopTypes.CustomActionFunction {
  return async (answers) => {
    const hasChanges = await installDependencies(
      appPath,
      externalPackages,
      answers._workspaceDependenciesChanged === true
    )

    return hasChanges
      ? `${appPath}: dependencies installed`
      : `[SKIPPED] ${appPath}: dependencies already installed`
  }
}

export function getFormatAction(paths: string[]): PlopTypes.CustomActionFunction {
  return async (answers) => {
    if (!answers._hasPlannedChanges) return "[SKIPPED] formatting: connection is already current"

    const resolvedPaths = await Promise.all(
      paths.map(async (path) => {
        const file = Bun.file(path)
        return (await file.exists()) ? path : undefined
      })
    )
    const existingPaths = resolvedPaths.filter((path): path is string => path !== undefined)

    if (existingPaths.length === 0) return "[SKIPPED] formatting: no generated files exist"

    await Bun.$`bun run format -- ${existingPaths}`
    return `Formatted ${existingPaths.length} generated files`
  }
}

export function getRouteTreeAction(
  appPath: string,
  expectedRoute: string
): PlopTypes.CustomActionFunction {
  return async (answers) => {
    if (!answers._hasPlannedChanges) {
      return `[SKIPPED] ${appPath}/src/routeTree.gen.ts is already current`
    }

    const generateRoutes = 'import { resolveConfig } from "vite"; await resolveConfig({}, "build")'
    await Bun.$`cd ${appPath} && CI=1 bun --eval ${generateRoutes}`
    if (!(await fileContains(`${appPath}/src/routeTree.gen.ts`, expectedRoute))) {
      throw new Error(
        `${appPath}'s Vite router plugin did not add "${expectedRoute}" to src/routeTree.gen.ts.`
      )
    }
    return `${appPath}/src/routeTree.gen.ts regenerated`
  }
}

export function getSummaryAction(): PlopTypes.CustomActionFunction {
  return (answers) =>
    answers._hasPlannedChanges
      ? `Connected apps/${answers.app} to ${answers.backend}`
      : `No changes needed: apps/${answers.app} is already connected to ${answers.backend}`
}

export function getAppendAction(
  path: string,
  templateFile: string,
  marker: string
): PlopTypes.AppendActionConfig {
  return {
    path,
    pattern: /$/,
    separator: "\n",
    skip: async () =>
      (await fileContains(path, marker)) ? `${path} already contains ${marker}` : false,
    templateFile,
    type: "append",
    unique: false,
  }
}

export async function hasDependency(packagePath: string, packageName: string): Promise<boolean> {
  const packageJson = (await Bun.file(`${packagePath}/package.json`).json()) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  return Boolean(
    packageJson.dependencies?.[packageName] ?? packageJson.devDependencies?.[packageName]
  )
}

export async function ensureBaseApp(answers: ConnectBackendAnswers): Promise<void> {
  await ensureWorkspaceExists(`apps/${answers.app}`, `bun template add app ${answers.app}`)
  await loadSharedPackageNames(answers)
}

export async function ensureApiWorkspace(answers: ConnectBackendAnswers): Promise<void> {
  await ensureWorkspaceExists("apps/api", "bun template add app api")
  Object.assign(answers, { apiPackage: await readPackageName("apps/api") })
}

export async function ensureBackendWorkspace(answers: ConnectBackendAnswers): Promise<void> {
  await ensureWorkspaceExists("packages/backend", "bun template add package backend")
  Object.assign(answers, {
    backendPackage: await readPackageName("packages/backend"),
  })
}
