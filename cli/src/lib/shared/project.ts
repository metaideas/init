import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import { PackageJsonParseFailed } from "#lib/shared/errors.ts"

const PROJECT_NAME_REGEX = /^[a-z0-9][a-z0-9-_]*$/

export function getProjectNameValidationError(value: string | undefined) {
  const name = value?.trim() ?? ""
  if (!name) return "Project name is required."
  return PROJECT_NAME_REGEX.test(name)
    ? undefined
    : "Project name can only contain lowercase letters, numbers, hyphens, and underscores."
}

export function normalizeProjectName(value: string) {
  return value.trim()
}

export const PackageJsonSchema = Schema.Struct({ name: Schema.String })
const PackageJsonRecordSchema = Schema.Record(Schema.String, Schema.Unknown)

export const readPackageJson = Effect.fn("readPackageJson")(function* () {
  const fs = yield* FileSystem.FileSystem
  const content = yield* fs.readFileString("package.json")
  return yield* Schema.decodeUnknownEffect(Schema.fromJsonString(PackageJsonSchema))(content).pipe(
    Effect.mapError((cause) => new PackageJsonParseFailed({ cause }))
  )
})

export const updatePackageJson = Effect.fn("updatePackageJson")(function* (
  projectName: string,
  version?: string
) {
  const fs = yield* FileSystem.FileSystem
  const content = yield* fs.readFileString("package.json")
  const packageJson = yield* Schema.decodeUnknownEffect(
    Schema.fromJsonString(PackageJsonRecordSchema)
  )(content).pipe(Effect.mapError((cause) => new PackageJsonParseFailed({ cause })))
  const updated = { ...packageJson, name: projectName, ...(version ? { version } : {}) }
  yield* fs.writeFileString("package.json", `${JSON.stringify(updated, null, 2)}\n`)
})

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".cache",
  ".pnpm-store",
  ".yarn",
]

const EXCLUDED_FILES = [".DS_Store"]
const PATH_NORMALIZE_REGEX = /^\.\//
const PATH_SEP_NORMALIZE_REGEX = /\\/g

export function checkShouldExclude(filePath: string) {
  const normalizedPath = filePath
    .replace(PATH_NORMALIZE_REGEX, "")
    .replace(PATH_SEP_NORMALIZE_REGEX, "/")

  if (
    EXCLUDED_DIRS.some(
      (dir) =>
        normalizedPath.includes(`/${dir}/`) ||
        normalizedPath.endsWith(`/${dir}`) ||
        normalizedPath.startsWith(`${dir}/`)
    )
  ) {
    return true
  }

  return EXCLUDED_FILES.some(
    (file) => normalizedPath.endsWith(`/${file}`) || normalizedPath === file
  )
}

const TEXT_FILE_EXTENSIONS = [
  ".astro",
  ".css",
  ".env",
  ".example",
  ".hbs",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdc",
  ".mdx",
  ".scss",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]

export function checkIsTextFile(file: string) {
  return (
    TEXT_FILE_EXTENSIONS.some((extension) => file.endsWith(extension)) ||
    file.includes("package.json") ||
    file.includes("tsconfig") ||
    file.includes("README")
  )
}

export const getAllFiles = Effect.fn("getAllFiles")(function* () {
  const fs = yield* FileSystem.FileSystem
  const files = yield* fs.readDirectory(".", { recursive: true })
  return files.filter((file) => !checkShouldExclude(file))
})

export const replaceProjectNameInProjectFiles = Effect.fn("replaceProjectNameInProjectFiles")(
  function* (projectName: string, currentProjectName?: string) {
    const fs = yield* FileSystem.FileSystem
    const allFiles = yield* getAllFiles()

    yield* Effect.forEach(
      allFiles.filter((file) => checkIsTextFile(file)),
      (file) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(file)
          let replaced = content.replaceAll("@init", `@${projectName}`)

          if (currentProjectName && currentProjectName !== "init") {
            replaced = replaced.replaceAll(`@${currentProjectName}`, `@${projectName}`)
          }

          if (content !== replaced) yield* fs.writeFileString(file, replaced)
        }),
      { concurrency: 10, discard: true }
    )
  }
)
