import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import type {
  ManifestWorkspace,
  TemplateManifest,
  WorkspaceRelationship,
  WorkspaceType,
} from "#lib/templates/manifest.ts"
import {
  InvalidWorkspaceSelection,
  OperationCancelled,
  PackageJsonParseFailed,
} from "#lib/core/errors.ts"
import { getProjectNameValidationError } from "#lib/projects/files.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { getWorkspacesByType } from "#lib/templates/manifest.ts"
import { resolveSelection, type RecommendationOmission } from "#lib/workspaces/selection.ts"

const PackageJsonRecordSchema = Schema.Record(Schema.String, Schema.Unknown)
const DependencyRecordSchema = Schema.Record(Schema.String, Schema.String)

type WorkspaceDependencyEdit = {
  readonly dependencySection: NonNullable<WorkspaceRelationship["dependencySection"]>
  readonly source: string
  readonly targetName: string
}

export type WorkspaceAdditionPlan = {
  readonly dependencyEdits: readonly WorkspaceDependencyEdit[]
  readonly recommendations: readonly RecommendationOmission[]
  readonly requestedWorkspace: ManifestWorkspace
  readonly requiredWorkspaces: readonly ManifestWorkspace[]
  readonly workspaces: readonly ManifestWorkspace[]
}

function readWorkspacePackageJson(packageJsonPath: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* Schema.decodeUnknownEffect(Schema.fromJsonString(PackageJsonRecordSchema))(
      yield* fs.readFileString(packageJsonPath)
    ).pipe(Effect.mapError((cause) => new PackageJsonParseFailed({ cause })))
  })
}

const getExistingWorkspaceIds = Effect.fn("getExistingWorkspaceIds")(function* (
  manifest: TemplateManifest
) {
  const fs = yield* FileSystem.FileSystem
  const checks = yield* Effect.all(
    manifest.workspaces.map((workspace) =>
      fs.exists(workspace.dir).pipe(Effect.map((exists) => ({ exists, id: workspace.id })))
    )
  )
  return new Set(checks.filter(({ exists }) => exists).map(({ id }) => id))
})

const copyWorkspace = Effect.fn("copyWorkspace")(function* (
  sourceDirectory: string,
  destinationDirectory: string
) {
  const fs = yield* FileSystem.FileSystem
  if (yield* fs.exists(destinationDirectory)) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: `Destination already exists: ${destinationDirectory}`,
      })
    )
  }
  yield* fs.copy(sourceDirectory, destinationDirectory, { overwrite: false })
})

const updateWorkspacePackageName = Effect.fn("updateWorkspacePackageName")(function* (
  packageJsonPath: string,
  name: string
) {
  const fs = yield* FileSystem.FileSystem
  const packageJson = yield* readWorkspacePackageJson(packageJsonPath)
  yield* fs.writeFileString(
    packageJsonPath,
    `${JSON.stringify({ ...packageJson, name }, null, 2)}\n`
  )
})

const removeWorkspaceDependency = Effect.fn("removeWorkspaceDependency")(function* (
  packageJsonPath: string,
  dependencySection: NonNullable<WorkspaceRelationship["dependencySection"]>,
  dependencyName: string
) {
  const fs = yield* FileSystem.FileSystem
  const packageJson = yield* readWorkspacePackageJson(packageJsonPath)
  const dependencies = yield* Schema.decodeUnknownEffect(DependencyRecordSchema)(
    packageJson[dependencySection] ?? {}
  ).pipe(Effect.mapError((cause) => new PackageJsonParseFailed({ cause })))
  const { [dependencyName]: _, ...remainingDependencies } = dependencies
  yield* fs.writeFileString(
    packageJsonPath,
    `${JSON.stringify({ ...packageJson, [dependencySection]: remainingDependencies }, null, 2)}\n`
  )
})

function getWorkspaceDestination(
  workspace: ManifestWorkspace,
  requestedId: string,
  destinationName: string
) {
  if (workspace.id !== requestedId) return workspace.dir
  const parentDirectory = workspace.type === "app" ? "apps" : "packages"
  return `${parentDirectory}/${destinationName}`
}

function getWorkspacePackageName(
  workspace: ManifestWorkspace,
  projectName: string,
  destinationName: string
) {
  return workspace.type === "app" ? destinationName : `@${projectName}/${destinationName}`
}

const planWorkspaceAddition = Effect.fn("planWorkspaceAddition")(function* (
  manifest: TemplateManifest,
  type: Extract<WorkspaceType, "app" | "package">,
  requestedId: string
) {
  const requestedWorkspace = manifest.workspaces.find(
    (workspace) => workspace.type === type && workspace.id === requestedId
  )
  if (!requestedWorkspace) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: `Unknown ${type}: ${requestedId}`,
      })
    )
  }

  const existingIds = yield* getExistingWorkspaceIds(manifest)
  const selection = resolveSelection(manifest, new Set([...existingIds, requestedWorkspace.id]))
  if (selection.dangling.length > 0) {
    return yield* Effect.fail(
      new InvalidWorkspaceSelection({
        details: selection.dangling.join("\n"),
      })
    )
  }

  const workspaces = manifest.workspaces.filter(
    (workspace) =>
      selection.selected.has(workspace.id) &&
      (workspace.id === requestedWorkspace.id || !existingIds.has(workspace.id))
  )
  const requiredWorkspaces = workspaces.filter(
    (workspace) => workspace.id !== requestedWorkspace.id
  )
  const workspaceIds = new Set(workspaces.map((workspace) => workspace.id))
  const recommendations = selection.recommendations.filter((recommendation) =>
    workspaceIds.has(recommendation.source)
  )
  const workspaceById = new Map(manifest.workspaces.map((workspace) => [workspace.id, workspace]))
  const dependencyEdits = recommendations.flatMap((edit) => {
    if (!edit.dependencySection) return []
    const target = workspaceById.get(edit.target)
    if (!target) return []

    return [
      {
        dependencySection: edit.dependencySection,
        source: edit.source,
        targetName: target.name,
      },
    ]
  })

  return {
    dependencyEdits,
    recommendations,
    requestedWorkspace,
    requiredWorkspaces,
    workspaces,
  } satisfies WorkspaceAdditionPlan
})

const validateWorkspaceDestination = Effect.fn("validateWorkspaceDestination")(function* (
  destinationName: string
) {
  const error = getProjectNameValidationError(destinationName)
  if (!error) return

  return yield* Effect.fail(
    new InvalidWorkspaceSelection({ details: `Invalid destination name: ${error}` })
  )
})

export const selectWorkspaceAddition = Effect.fn("selectWorkspaceAddition")(function* (
  manifest: TemplateManifest,
  options: {
    readonly type: Extract<WorkspaceType, "app" | "package">
    readonly workspace?: string
  }
) {
  const requestedId =
    options.workspace ??
    (yield* Effect.gen(function* () {
      const prompter = yield* Prompter
      return yield* prompter.select({
        message: `Select the ${options.type} to add from the init template`,
        options: getWorkspacesByType(manifest, options.type).map((workspace) => ({
          hint: workspace.description,
          label: workspace.id,
          value: workspace.id,
        })),
      })
    }))

  return yield* planWorkspaceAddition(manifest, options.type, requestedId)
})

export const confirmWorkspaceAddition = Effect.fn("confirmWorkspaceAddition")(function* (
  plan: WorkspaceAdditionPlan,
  options: {
    readonly destination?: string
    readonly yes: boolean
  }
) {
  const prompter = yield* Prompter

  if (plan.requiredWorkspaces.length > 0) {
    yield* prompter.log.info(
      `Required workspaces: ${plan.requiredWorkspaces.map((workspace) => workspace.id).join(", ")}`
    )
    if (
      !options.yes &&
      !(yield* prompter.confirm({
        initialValue: true,
        message: "Add these required workspaces?",
      }))
    ) {
      return yield* Effect.fail(new OperationCancelled())
    }
  }

  if (plan.recommendations.length > 0) {
    yield* prompter.log.warning(
      `Unfulfilled recommendations:\n${plan.recommendations
        .map(
          (recommendation) =>
            `${recommendation.source} → ${recommendation.target}: ${recommendation.reason}`
        )
        .join("\n")}`
    )
  }

  const destinationName =
    options.destination ??
    (options.yes
      ? plan.requestedWorkspace.id
      : yield* prompter.text({
          defaultValue: plan.requestedWorkspace.id,
          message: `Name your ${plan.requestedWorkspace.type}`,
        }))
  yield* validateWorkspaceDestination(destinationName)
  return destinationName
})

export const writeWorkspaceAddition = Effect.fn("writeWorkspaceAddition")(function* (options: {
  readonly destinationName: string
  readonly plan: WorkspaceAdditionPlan
  readonly projectName: string
  readonly templateDirectory: string
}) {
  const fs = yield* FileSystem.FileSystem
  const copiedDirectories: string[] = []
  const destinationByWorkspace = new Map<string, string>()

  return yield* Effect.gen(function* () {
    for (const workspace of options.plan.workspaces) {
      const destination = getWorkspaceDestination(
        workspace,
        options.plan.requestedWorkspace.id,
        options.destinationName
      )
      yield* copyWorkspace(`${options.templateDirectory}/${workspace.dir}`, destination)
      copiedDirectories.push(destination)
      destinationByWorkspace.set(workspace.id, destination)

      if (workspace.id === options.plan.requestedWorkspace.id) {
        const packageName = getWorkspacePackageName(
          workspace,
          options.projectName,
          options.destinationName
        )
        yield* updateWorkspacePackageName(`${destination}/package.json`, packageName)
      }
    }

    for (const edit of options.plan.dependencyEdits) {
      const sourceDirectory = destinationByWorkspace.get(edit.source)
      if (!sourceDirectory) continue
      yield* removeWorkspaceDependency(
        `${sourceDirectory}/package.json`,
        edit.dependencySection,
        edit.targetName
      )
    }

    return copiedDirectories
  }).pipe(
    Effect.onError(() =>
      Effect.forEach(
        copiedDirectories,
        (directory) => fs.remove(directory, { force: true, recursive: true }).pipe(Effect.ignore),
        { discard: true }
      )
    )
  )
})
