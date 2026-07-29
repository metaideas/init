import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import type { WorkspaceConfiguration } from "#lib/workspaces/configuration.ts"
import { InvalidWorkspaceSelection, PackageJsonParseFailed } from "#lib/core/errors.ts"
import { getAllFiles } from "#lib/projects/files.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { checkIsInternalPath } from "#lib/templates/paths.ts"
import { resolveSelection } from "#lib/workspaces/selection.ts"

const PackageJsonRecordSchema = Schema.Record(Schema.String, Schema.Unknown)
const DependencyRecordSchema = Schema.Record(Schema.String, Schema.String)
const WORKSPACE_REFERENCE_EXTENSIONS = [
  ".astro",
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mdx",
  ".mjs",
  ".mts",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]

const removeUnselectedWorkspaces = Effect.fn("removeUnselectedWorkspaces")(function* (
  manifest: TemplateManifest,
  selected: ReadonlySet<string>
) {
  const fs = yield* FileSystem.FileSystem
  const pathsToRemove = manifest.workspaces
    .filter(
      (workspace) =>
        (workspace.type === "app" || workspace.type === "package") && !selected.has(workspace.id)
    )
    .map((workspace) => workspace.dir)

  yield* Effect.forEach(
    pathsToRemove,
    (path) => fs.remove(path, { force: true, recursive: true }),
    { concurrency: 10, discard: true }
  )
})

const applyRecommendationOmissions = Effect.fn("applyRecommendationOmissions")(function* (
  manifest: TemplateManifest,
  selected: ReadonlySet<string>
) {
  const fs = yield* FileSystem.FileSystem
  const plan = resolveSelection(manifest, selected)

  yield* Effect.forEach(
    plan.manifestEdits,
    (edit) =>
      Effect.gen(function* () {
        if (!edit.dependencySection) return
        const source = manifest.workspaces.find((workspace) => workspace.id === edit.source)
        const target = manifest.workspaces.find((workspace) => workspace.id === edit.target)
        if (!source || !target) return
        const packageJsonPath = `${source.dir}/package.json`
        const packageJson = yield* Schema.decodeUnknownEffect(
          Schema.fromJsonString(PackageJsonRecordSchema)
        )(yield* fs.readFileString(packageJsonPath)).pipe(
          Effect.mapError((cause) => new PackageJsonParseFailed({ cause }))
        )
        const dependencies = yield* Schema.decodeUnknownEffect(DependencyRecordSchema)(
          packageJson[edit.dependencySection]
        ).pipe(Effect.mapError((cause) => new PackageJsonParseFailed({ cause })))
        const { [target.name]: _, ...remainingDependencies } = dependencies
        yield* fs.writeFileString(
          packageJsonPath,
          `${JSON.stringify(
            {
              ...packageJson,
              [edit.dependencySection]: remainingDependencies,
            },
            null,
            2
          )}\n`
        )
      }),
    { concurrency: 10, discard: true }
  )
})

function checkHasWorkspaceReference(content: string, workspaceName: string) {
  const escapedName = workspaceName.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const importPattern = new RegExp(
    String.raw`(?:from\s+|import\(|require\()["']${escapedName}(?:["'/])`
  )
  return (
    content.includes(`"${workspaceName}": "workspace:`) ||
    content.includes(`'${workspaceName}': 'workspace:`) ||
    importPattern.test(content)
  )
}

function checkCanContainWorkspaceReference(file: string) {
  return (
    file === "package.json" ||
    file.endsWith("/package.json") ||
    WORKSPACE_REFERENCE_EXTENSIONS.some((extension) => file.endsWith(extension))
  )
}

const validatePostPrune = Effect.fn("validatePostPrune")(function* (
  manifest: TemplateManifest,
  selected: ReadonlySet<string>
) {
  const fs = yield* FileSystem.FileSystem
  const removedWorkspaces = manifest.workspaces.filter((workspace) => !selected.has(workspace.id))
  const files = (yield* getAllFiles(manifest.excludedPaths)).filter(
    (file) =>
      checkCanContainWorkspaceReference(file) &&
      !checkIsInternalPath(file, [...manifest.cleanupPaths, ...manifest.excludedPaths]) &&
      !removedWorkspaces.some(
        (workspace) => file === workspace.dir || file.startsWith(`${workspace.dir}/`)
      )
  )
  const dangling: string[] = []
  const warnings: string[] = []

  for (const file of files) {
    const content = yield* fs.readFileString(file)
    const source = manifest.workspaces.find(
      (workspace) => file === workspace.dir || file.startsWith(`${workspace.dir}/`)
    )

    for (const target of removedWorkspaces) {
      if (!checkHasWorkspaceReference(content, target.name)) continue
      const recommendation = source?.relationships.find(
        (relationship) => relationship.kind === "recommended" && relationship.target === target.id
      )
      const message = `${file} references removed workspace ${target.name}`
      if (recommendation) warnings.push(message)
      else dangling.push(message)
    }
  }

  if (dangling.length > 0) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: `Dangling workspace references remain:\n${dangling.join("\n")}`,
      })
    )
  }

  return warnings
})

export const pruneWorkspaces = Effect.fn("pruneWorkspaces")(function* (
  manifest: TemplateManifest,
  configuration: WorkspaceConfiguration
) {
  const prompter = yield* Prompter

  yield* prompter.log.info("Removing unselected workspaces...")
  yield* removeUnselectedWorkspaces(manifest, configuration.selected)
  yield* applyRecommendationOmissions(manifest, configuration.selected)
  const warnings = yield* validatePostPrune(manifest, configuration.selected)
  if (warnings.length > 0) {
    yield* prompter.log.warning(
      `References to omitted recommendations remain:\n${warnings.join("\n")}`
    )
  }
  yield* prompter.log.success("Workspaces removed")

  return manifest.workspaces
    .filter(
      (workspace) =>
        configuration.selected.has(workspace.id) &&
        (workspace.type === "app" || workspace.type === "package")
    )
    .map((workspace) => workspace.dir)
})
