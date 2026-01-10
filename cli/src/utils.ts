import { FileSystem } from "@effect/platform"
import { Octokit } from "@octokit/rest"
import { Data, Effect, Schema } from "effect"

export class OperationCancelled extends Data.TaggedError("OperationCancelled") {}
export class DownloadFailed extends Data.TaggedError("DownloadFailed")<{
  readonly cause: unknown
}> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class InstallFailed extends Data.TaggedError("InstallFailed")<{ readonly cause: unknown }> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class GitInitFailed extends Data.TaggedError("GitInitFailed")<{ readonly cause: unknown }> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class TurboGenFailed extends Data.TaggedError("TurboGenFailed")<{
  readonly cause: unknown
}> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class GitCloneFailed extends Data.TaggedError("GitCloneFailed")<{
  readonly cause: unknown
}> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class VersionCheckFailed extends Data.TaggedError("VersionCheckFailed")<{
  readonly cause: unknown
}> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}
export class NotInInitProject extends Data.TaggedError("NotInInitProject") {}
export class WorkingTreeDirty extends Data.TaggedError("WorkingTreeDirty") {}
export class PackageJsonParseFailed extends Data.TaggedError("PackageJsonParseFailed")<{
  readonly cause: unknown
}> {
  override get message(): string {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}

export const PackageJsonSchema = Schema.Struct({
  name: Schema.String,
})

export const readPackageJson = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const content = yield* fs.readFileString("package.json")
    const parsed = yield* Effect.try({
      try: () => JSON.parse(content),
      catch: (e) => new PackageJsonParseFailed({ cause: e }),
    })
    return yield* Schema.decodeUnknown(PackageJsonSchema)(parsed).pipe(
      Effect.mapError((e) => new PackageJsonParseFailed({ cause: e }))
    )
  })

export const ReleaseInfoSchema = Schema.Struct({
  tagName: Schema.String,
  name: Schema.String,
  publishedAt: Schema.String,
  body: Schema.String,
})

export type ReleaseInfo = typeof ReleaseInfoSchema.Type

const TEMPLATE_VERSION_FILE = ".template-version.json"
const VERSION_PREFIX_REGEX = /^v/

export const getVersion = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(TEMPLATE_VERSION_FILE)
    if (!exists) {
      return null
    }

    const content = yield* fs
      .readFileString(TEMPLATE_VERSION_FILE)
      .pipe(Effect.catchAll(() => Effect.succeed("{}")))

    try {
      const data = JSON.parse(content) as Record<string, unknown>
      return (data["."] as string | undefined) ?? null
    } catch {
      return null
    }
  }).pipe(Effect.catchAll(() => Effect.succeed(null)))

export const getLatestRelease = () => {
  const octokit = new Octokit()

  return Effect.tryPromise({
    try: () =>
      octokit.repos.getLatestRelease({
        owner: "metaideas",
        repo: "init",
      }),
    catch: (e) => new VersionCheckFailed({ cause: e }),
  }).pipe(
    Effect.flatMap((response) =>
      Schema.decode(ReleaseInfoSchema)({
        body: response.data.body ?? "",
        name: response.data.name ?? "",
        publishedAt: response.data.published_at ?? "",
        tagName: response.data.tag_name,
      })
    ),
    Effect.mapError((e) => new VersionCheckFailed({ cause: e }))
  )
}

export const compareVersions = (current: string, latest: string) => {
  const currentClean = current.replace(VERSION_PREFIX_REGEX, "")
  const latestClean = latest.replace(VERSION_PREFIX_REGEX, "")

  const currentParts = currentClean.split(".").map(Number)
  const latestParts = latestClean.split(".").map(Number)

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i += 1) {
    const currentPart = currentParts[i] ?? 0
    const latestPart = latestParts[i] ?? 0

    if (currentPart < latestPart) {
      return -1
    }
    if (currentPart > latestPart) {
      return 1
    }
  }

  return 0
}

export const updateTemplateVersion = (version: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const data = { ".": version }
    yield* fs.writeFileString(TEMPLATE_VERSION_FILE, `${JSON.stringify(data, null, 2)}\n`)
  }).pipe(Effect.catchAll(() => Effect.void))

export const requireInitProject = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(TEMPLATE_VERSION_FILE)
    if (!exists) {
      return yield* Effect.fail(new NotInInitProject())
    }
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
  "scripts/template",
] as const

const EXCLUDED_FILES = [".DS_Store"] as const
const PATH_NORMALIZE_REGEX = /^\.\//
const PATH_SEP_NORMALIZE_REGEX = /\\/g

export const checkShouldExclude = (filePath: string) => {
  const normalizedPath = filePath
    .replace(PATH_NORMALIZE_REGEX, "")
    .replace(PATH_SEP_NORMALIZE_REGEX, "/")

  const containsExcludedDir = EXCLUDED_DIRS.some(
    (dir) =>
      normalizedPath.includes(`/${dir}/`) ||
      normalizedPath.endsWith(`/${dir}`) ||
      normalizedPath.startsWith(`${dir}/`)
  )

  if (containsExcludedDir) {
    return true
  }

  const endsWithExcludedFile = EXCLUDED_FILES.some(
    (file) => normalizedPath.endsWith(`/${file}`) || normalizedPath === file
  )

  return endsWithExcludedFile
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
] as const

export const isTextFile = (file: string) =>
  TEXT_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)) ||
  file.includes("package.json") ||
  file.includes("tsconfig") ||
  file.includes("README")

export const getAllFiles = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readDirectory(".", { recursive: true }).pipe(
      Effect.map((files) => files.filter((file) => !checkShouldExclude(file))),
      Effect.orElseSucceed(() => [])
    )
  })

export const replaceProjectNameInProjectFiles = (
  projectName: string,
  currentProjectName?: string
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const allFiles = yield* getAllFiles()
    const textFiles = allFiles.filter(isTextFile)

    yield* Effect.forEach(
      textFiles,
      (file) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(file)
          let replaced = content.replaceAll("@init", `@${projectName}`)

          if (currentProjectName && currentProjectName !== "init") {
            replaced = replaced.replaceAll(`@${currentProjectName}`, `@${projectName}`)
          }

          if (content !== replaced) {
            yield* fs.writeFileString(file, replaced)
          }
        }).pipe(Effect.orElse(() => Effect.void)),
      { concurrency: 10, discard: true }
    )
  })
