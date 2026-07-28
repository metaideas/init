import { FileSystem } from "@effect/platform"
import { Octokit } from "@octokit/rest"
import { Data, Effect, Schema } from "effect"
import { compare, valid } from "semver"

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
export class InvalidVersion extends Data.TaggedError("InvalidVersion")<{
  readonly version: string
}> {
  override get message(): string {
    return `Invalid version: ${this.version}`
  }
}
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

const TEMPLATE_VERSION_FILE = ".template-version.json"
const COMPONENT_PREFIX_REGEX = /^.*@/
const TemplateVersionSchema = Schema.Struct({ ".": Schema.String })

export const normalizeVersion = (version: string) => {
  const normalizedVersion = valid(version.replace(COMPONENT_PREFIX_REGEX, ""))
  return normalizedVersion
    ? Effect.succeed(normalizedVersion)
    : Effect.fail(new InvalidVersion({ version }))
}

export const getVersion = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(TEMPLATE_VERSION_FILE)
    if (!exists) {
      return null
    }

    const content = yield* fs.readFileString(TEMPLATE_VERSION_FILE)
    return yield* Effect.try(() => JSON.parse(content)).pipe(
      Effect.flatMap(Schema.decodeUnknown(TemplateVersionSchema)),
      Effect.flatMap((data) => normalizeVersion(data["."])),
      Effect.map((version): string | null => version),
      Effect.catchAll(() => Effect.succeed(null))
    )
  })

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

export const compareVersions = (current: string, latest: string) =>
  Effect.gen(function* () {
    const currentVersion = yield* normalizeVersion(current)
    const latestVersion = yield* normalizeVersion(latest)
    return compare(currentVersion, latestVersion)
  })

export const updateTemplateVersion = (version: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const data = { ".": yield* normalizeVersion(version) }
    yield* fs.writeFileString(TEMPLATE_VERSION_FILE, `${JSON.stringify(data, null, 2)}\n`)
  })

export const updatePackageJson = (projectName: string, version?: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const content = yield* fs.readFileString("package.json")
    const packageJson = yield* Effect.try({
      try: () => JSON.parse(content) as Record<string, unknown>,
      catch: (e) => new PackageJsonParseFailed({ cause: e }),
    })
    packageJson.name = projectName
    if (version) packageJson.version = version
    yield* fs.writeFileString("package.json", `${JSON.stringify(packageJson, null, 2)}\n`)
  })

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
