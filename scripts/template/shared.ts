import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path"
import * as Faultier from "faultier"

export class CommandFailedError extends Faultier.Tagged("CommandFailedError")<{
  command: string
  exitCode: number
}>() {}

export class InvalidArgumentsError extends Faultier.Tagged("InvalidArgumentsError")() {}

export class InvalidScopeError extends Faultier.Tagged("InvalidScopeError")<{
  scope: string
}>() {}

export class PathEscapeError extends Faultier.Tagged("PathEscapeError")<{
  path: string
}>() {}

export class TemplateFetchError extends Faultier.Tagged("TemplateFetchError")() {}

export class UnknownWorkspaceError extends Faultier.Tagged("UnknownWorkspaceError")<{
  kind: string
  names: string
}>() {}

export const TemplateFault = Faultier.registry({
  CommandFailedError,
  InvalidArgumentsError,
  InvalidScopeError,
  PathEscapeError,
  TemplateFetchError,
  UnknownWorkspaceError,
})

export const TEMPLATE_SCOPE = "init"

const ignoredDirectories = new Set([".cache", ".git", ".turbo", "build", "dist", "node_modules"])

export type WorkspaceKind = "app" | "package"

export type Workspace = {
  directory: string
  name: string
}

export type JsonValue = boolean | null | number | string | JsonObject | JsonValue[]

export type JsonObject = {
  [key: string]: JsonValue | undefined
}

export async function readJson(path: string): Promise<JsonObject> {
  const value: unknown = JSON.parse(await Bun.file(path).text())
  if (value === null || !(value instanceof Object) || Array.isArray(value))
    throw new Error(`Expected ${path} to contain a JSON object.`)

  // SAFETY: JSON.parse returned a non-null, non-array object, and JSON values have the JsonValue contract.
  return value as JsonObject
}

export async function writeJson(path: string, value: JsonValue) {
  await Bun.write(path, `${JSON.stringify(value, null, 2)}\n`)
}

export function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return (
    value !== null && value !== undefined && !Array.isArray(value) && value.constructor === Object
  )
}

export function getJsonString(object: JsonObject, key: string) {
  const value = object[key]
  return value?.constructor === String ? String(value) : undefined
}

export function getJsonObject(object: JsonObject, key: string) {
  const value = object[key]
  return isJsonObject(value) ? value : undefined
}

export function getJsonStringArray(object: JsonObject, key: string) {
  const value = object[key]
  if (!Array.isArray(value) || !value.every((entry) => entry?.constructor === String)) return

  return value.map(String)
}

export function normalizeScope(scope: string) {
  const normalizedScope = scope.replace(/^@/, "").trim()

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(normalizedScope)) {
    throw TemplateFault.create("InvalidScopeError", { scope }).withDescription(
      "The npm scope must contain only letters, numbers, and dashes.",
      `Received scope: ${JSON.stringify(scope)}.`
    )
  }

  return normalizedScope
}

export function getScopePrefix(scope: string) {
  return `@${scope}/`
}

export function getDependencyNames(packageJson: JsonObject) {
  return ["dependencies", "devDependencies", "peerDependencies"].flatMap((field) =>
    Object.keys(getJsonObject(packageJson, field) ?? {})
  )
}

export async function getWorkspaces(rootDir: string, kind: WorkspaceKind) {
  const workspaceRoot = join(rootDir, `${kind}s`)
  const workspaceFiles = new Bun.Glob("*/package.json")
  const workspaces: Workspace[] = []

  for await (const packageFile of workspaceFiles.scan({ cwd: workspaceRoot })) {
    const directory = dirname(packageFile)
    workspaces.push({
      directory: join(workspaceRoot, directory),
      name: basename(directory),
    })
  }

  return workspaces.toSorted((left, right) => left.name.localeCompare(right.name))
}

export async function getTextFiles(rootDir: string) {
  const files = new Bun.Glob("**/*")
  const paths: string[] = []

  for await (const relativePath of files.scan({
    cwd: rootDir,
    dot: true,
    onlyFiles: true,
  })) {
    if (relativePath.split("/").some((part) => ignoredDirectories.has(part))) continue

    paths.push(join(rootDir, relativePath))
  }

  const textFiles = await Promise.all(
    paths.map(async (path) => {
      const bytes = new Uint8Array(await Bun.file(path).arrayBuffer())
      return bytes.includes(0) ? undefined : path
    })
  )

  return textFiles.filter((path): path is string => path !== undefined)
}

export async function replaceTextInFiles(rootDir: string, search: string, replacement: string) {
  const textFiles = await getTextFiles(rootDir)
  const changedFiles = await Promise.all(
    textFiles.map(async (path) => {
      const contents = await Bun.file(path).text()
      if (!contents.includes(search)) return null

      await Bun.write(path, contents.replaceAll(search, replacement))
      return path
    })
  )

  return changedFiles.filter((path): path is string => path !== null)
}

export async function findTextReferences(rootDir: string, search: string) {
  const textFiles = await getTextFiles(rootDir)
  const matchingFiles = await Promise.all(
    textFiles.map(async (path) => {
      const contents = await Bun.file(path).text()
      return contents.includes(search) ? path : null
    })
  )

  return matchingFiles.filter((path): path is string => path !== null)
}

export async function getProjectScope(rootDir: string) {
  const workspaces = await Promise.all([
    getWorkspaces(rootDir, "app"),
    getWorkspaces(rootDir, "package"),
  ])

  const packageNames = await Promise.all(
    workspaces.flat().map(async (workspace) => {
      const packageJson = await readJson(join(workspace.directory, "package.json"))
      return getJsonString(packageJson, "name")
    })
  )
  const packageName = packageNames.find((name) => name !== undefined && /^@[^/]+\//.test(name))
  const match = packageName && /^@([^/]+)\//.exec(packageName)
  const scope = match?.[1]
  if (scope) return normalizeScope(scope)

  throw TemplateFault.create("InvalidScopeError", { scope: "" }).withDescription(
    "Could not determine the project npm scope from its workspaces.",
    "No workspace package name contains an npm scope."
  )
}

export function checkIsPathWithinRoot(rootDir: string, path: string) {
  const pathFromRoot = relative(rootDir, path)

  return (
    pathFromRoot !== "" &&
    pathFromRoot !== ".." &&
    !pathFromRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromRoot)
  )
}

export async function removePath(rootDir: string, relativePath: string) {
  const resolvedRootDir = resolve(rootDir)
  const path = resolve(resolvedRootDir, relativePath)

  if (!checkIsPathWithinRoot(resolvedRootDir, path)) {
    throw TemplateFault.create("PathEscapeError", { path: relativePath }).withDescription(
      `Cleanup path must be within the project: ${relativePath}`,
      `Resolved cleanup path: ${path}.`
    )
  }

  await Bun.$`rm -rf ${path}`.quiet()
}

export async function runCommand(command: string[], rootDir: string) {
  const process = Bun.spawn(command, {
    cwd: rootDir,
    stderr: "inherit",
    stdout: "inherit",
  })
  const exitCode = await process.exited

  if (exitCode !== 0) {
    throw TemplateFault.create("CommandFailedError", {
      command: command.join(" "),
      exitCode,
    }).withDescription(`Command failed: ${command.join(" ")}.`, `Exited with code ${exitCode}.`)
  }
}
