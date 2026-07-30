import type { PlopTypes } from "@turbo/gen"
import Bun from "bun"

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  name?: string
}

export function getAvailableApps(): string[] {
  try {
    const glob = new Bun.Glob("*/package.json")
    const entries = [...glob.scanSync({ cwd: `${process.cwd()}/apps` })]

    return entries
      .map((entry) => entry.split("/")[0])
      .filter((directory): directory is string => directory !== undefined)
      .toSorted()
  } catch {
    return []
  }
}

export function getAppChoices() {
  const apps = getAvailableApps()

  return apps.length > 0
    ? apps.map((app) => ({ name: app, value: app }))
    : [{ name: "No apps found", value: "" }]
}

export async function readPackageName(workspacePath: string): Promise<string> {
  const packageJsonPath = `${workspacePath}/package.json`
  const packageJson = (await Bun.file(packageJsonPath).json()) as PackageJson

  if (!packageJson.name) {
    throw new Error(`${packageJsonPath} does not declare a package name`)
  }

  return packageJson.name
}

export async function ensureWorkspaceExists(workspacePath: string, remedy: string): Promise<void> {
  if (await Bun.file(`${workspacePath}/package.json`).exists()) return

  throw new Error(`Required workspace "${workspacePath}" is missing. Run \`${remedy}\` first.`)
}

export async function addWorkspaceDependencies(
  packagePath: string,
  packageNames: string[],
  dev = false
): Promise<boolean> {
  const packageJsonPath = `${packagePath}/package.json`
  const packageJson = (await Bun.file(packageJsonPath).json()) as PackageJson
  const dependencyKey = dev ? "devDependencies" : "dependencies"
  const dependencies = packageJson[dependencyKey] ?? {}
  let hasChanges = false

  for (const packageName of packageNames) {
    if (dependencies[packageName] === "workspace:*") continue

    dependencies[packageName] = "workspace:*"
    hasChanges = true
  }

  if (!hasChanges) return false

  packageJson[dependencyKey] = Object.fromEntries(
    Object.entries(dependencies).toSorted(([left], [right]) => left.localeCompare(right))
  )
  await Bun.write(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)

  return true
}

export async function installDependencies(
  packagePath: string,
  externalPackages: string[],
  hasWorkspaceChanges: boolean
): Promise<boolean> {
  const packageJson = (await Bun.file(`${packagePath}/package.json`).json()) as PackageJson
  const installedPackages = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
  const missingPackages = externalPackages.filter(
    (packageName) => !(packageName in installedPackages)
  )

  if (missingPackages.length > 0) {
    await Bun.$`cd ${packagePath} && bun add --exact ${missingPackages}`
    return true
  }

  if (hasWorkspaceChanges) {
    await Bun.$`bun install`
    return true
  }

  return false
}

export async function fileContains(path: string, content: string): Promise<boolean> {
  const file = Bun.file(path)
  if (!(await file.exists())) return false

  const fileContent = await file.text()
  return fileContent.includes(content)
}

export function skipWhenFileContains(path: string, content: string, label = path) {
  return async () =>
    (await fileContains(path, content)) ? `${label} already contains its wiring` : false
}

export function getAddAction(
  path: string,
  templateFile: string,
  data?: Record<string, unknown>
): PlopTypes.AddActionConfig {
  return {
    data,
    path,
    skipIfExists: true,
    templateFile,
    type: "add",
  }
}
