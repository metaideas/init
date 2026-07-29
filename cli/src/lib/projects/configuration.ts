import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import { PackageJsonParseFailed } from "#lib/core/errors.ts"
import { replaceProjectNameInProjectFiles, updatePackageJson } from "#lib/projects/files.ts"
import { runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { updateTemplateVersion } from "#lib/templates/versions.ts"

const README_CONTENT = `
<div align="center">
  <h1 align="center"><code><project-name></code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `
const PackageJsonRecordSchema = Schema.Record(Schema.String, Schema.Unknown)
const ScriptRecordSchema = Schema.Record(Schema.String, Schema.String)
const templateCliIgnoreEntries = [
  {
    path: "knip.config.ts",
    source: '  ignore: ["cli/**"],\n',
  },
  {
    path: "oxfmt.config.ts",
    source: '    "cli/**",\n',
  },
  {
    path: "oxlint.config.ts",
    source:
      "    // The standalone CLI runs its own Adamantite checks outside the root workspace.\n" +
      '    "cli/**",\n',
  },
] as const

const setupEnvironmentVariables = Effect.fn("setupEnvironmentVariables")(function* (
  paths: readonly string[]
) {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.forEach(
    paths,
    (workspacePath) =>
      Effect.gen(function* () {
        const templatePath = `${workspacePath}/.env.template`
        const localPath = `${workspacePath}/.env.local`
        if ((yield* fs.exists(localPath)) || !(yield* fs.exists(templatePath))) return
        yield* fs.writeFileString(localPath, yield* fs.readFileString(templatePath))
      }),
    { concurrency: 10, discard: true }
  )
})

const cleanupTemplateMetadata = Effect.fn("cleanupTemplateMetadata")(function* () {
  const fs = yield* FileSystem.FileSystem
  const packageJson = yield* Schema.decodeUnknownEffect(
    Schema.fromJsonString(PackageJsonRecordSchema)
  )(yield* fs.readFileString("package.json")).pipe(
    Effect.mapError((cause) => new PackageJsonParseFailed({ cause }))
  )
  const scripts = yield* Schema.decodeUnknownEffect(ScriptRecordSchema)(
    packageJson.scripts ?? {}
  ).pipe(Effect.mapError((cause) => new PackageJsonParseFailed({ cause })))
  const { "generate:manifest": _, ...projectScripts } = scripts
  const { init: __, ...projectPackageJson } = packageJson
  yield* fs.writeFileString(
    "package.json",
    `${JSON.stringify({ ...projectPackageJson, scripts: projectScripts }, null, 2)}\n`
  )
  yield* Effect.forEach(
    templateCliIgnoreEntries,
    (entry) =>
      Effect.gen(function* () {
        if (!(yield* fs.exists(entry.path))) return
        const content = yield* fs.readFileString(entry.path)
        yield* fs.writeFileString(entry.path, content.replace(entry.source, ""))
      }),
    { concurrency: 3, discard: true }
  )
})

const cleanupInternalFiles = Effect.fn("cleanupInternalFiles")(function* (
  internalPaths: readonly string[]
) {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.forEach(
    internalPaths,
    (path) => fs.remove(path, { force: true, recursive: true }),
    { concurrency: 10, discard: true }
  )
})

export const configureProject = Effect.fn("configureProject")(function* (options: {
  readonly manifest: TemplateManifest
  readonly projectName: string
  readonly selectedWorkspacePaths: readonly string[]
  readonly templateVersion: string | null
}) {
  const fs = yield* FileSystem.FileSystem
  const prompter = yield* Prompter

  if (options.projectName !== "init") {
    yield* prompter.log.info("Updating package.json and file references...")
    yield* updatePackageJson(options.projectName, "0.0.1")
    yield* replaceProjectNameInProjectFiles(
      options.projectName,
      undefined,
      undefined,
      options.manifest.excludedPaths
    )
    yield* prompter.log.success("Project references updated")
  }
  yield* cleanupTemplateMetadata()

  yield* prompter.log.info("Setting up environment files...")
  yield* setupEnvironmentVariables(options.selectedWorkspacePaths)
  yield* prompter.log.success("Environment files setup complete")

  if (options.templateVersion) {
    yield* updateTemplateVersion(options.templateVersion)
  }
  yield* prompter.log.info("Cleaning up internal files...")
  yield* cleanupInternalFiles(options.manifest.cleanupPaths)
  yield* prompter.log.success("Internal files removed")

  yield* prompter.log.info("Creating README...")
  yield* fs.writeFileString(
    "README.md",
    README_CONTENT.replace("<project-name>", options.projectName)
  )
  yield* prompter.log.success("README created")
})

export const initializeGitRepository = Effect.fn("initializeGitRepository")(function* () {
  const fs = yield* FileSystem.FileSystem
  if (yield* fs.exists(".git")) return
  yield* runCommand({ args: ["init"], command: "git" })
})
