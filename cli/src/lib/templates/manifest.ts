import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import { ManifestParseFailed, ManifestReadFailed } from "#lib/core/errors.ts"

export const WorkspaceTypeSchema = Schema.Literals(["app", "package", "tooling"])
export const RelationshipKindSchema = Schema.Literals(["required", "recommended"])
export const DependencySectionSchema = Schema.Literals([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
])

export const WorkspaceRelationshipSchema = Schema.Struct({
  dependencySection: Schema.optionalKey(DependencySectionSchema),
  kind: RelationshipKindSchema,
  reason: Schema.optionalKey(Schema.String),
  target: Schema.String,
})

export const ManifestWorkspaceSchema = Schema.Struct({
  description: Schema.String,
  dir: Schema.String,
  id: Schema.String,
  name: Schema.String,
  relationships: Schema.Array(WorkspaceRelationshipSchema),
  type: WorkspaceTypeSchema,
})

export const TemplateManifestSchema = Schema.Struct({
  cleanupPaths: Schema.Array(Schema.String),
  excludedPaths: Schema.Array(Schema.String),
  workspaces: Schema.Array(ManifestWorkspaceSchema),
})

export type WorkspaceType = typeof WorkspaceTypeSchema.Type
export type WorkspaceRelationship = typeof WorkspaceRelationshipSchema.Type
export type ManifestWorkspace = typeof ManifestWorkspaceSchema.Type
export type TemplateManifest = typeof TemplateManifestSchema.Type

export function validateManifest(manifest: TemplateManifest) {
  const errors: string[] = []
  const workspaceIds = new Set<string>()
  const workspaceNames = new Set<string>()
  const workspaceDirs = new Set<string>()

  for (const workspace of manifest.workspaces) {
    if (workspaceIds.has(workspace.id)) errors.push(`Duplicate workspace id: ${workspace.id}`)
    if (workspaceNames.has(workspace.name))
      errors.push(`Duplicate workspace name: ${workspace.name}`)
    if (workspaceDirs.has(workspace.dir)) errors.push(`Duplicate workspace dir: ${workspace.dir}`)
    workspaceIds.add(workspace.id)
    workspaceNames.add(workspace.name)
    workspaceDirs.add(workspace.dir)
  }

  for (const workspace of manifest.workspaces) {
    for (const relationship of workspace.relationships) {
      if (!workspaceIds.has(relationship.target)) {
        errors.push(`${workspace.id} references unknown workspace ${relationship.target}`)
      }
      if (relationship.kind === "recommended" && !relationship.reason?.trim()) {
        errors.push(`${workspace.id} recommendation for ${relationship.target} requires a reason`)
      }
    }
  }

  return errors
}

export const readManifest = Effect.fn("readManifest")(function* (requestedPath?: string) {
  const fs = yield* FileSystem.FileSystem
  const path = requestedPath ?? "manifest.json"
  const content = yield* fs
    .readFileString(path)
    .pipe(Effect.mapError((cause) => new ManifestReadFailed({ cause, path })))
  const manifest = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(TemplateManifestSchema))(
    content
  ).pipe(Effect.mapError((cause) => new ManifestParseFailed({ cause })))
  const errors = validateManifest(manifest)

  if (errors.length > 0) {
    return yield* Effect.fail(new ManifestParseFailed({ cause: new Error(errors.join("\n")) }))
  }

  return manifest
})

export function getWorkspacesByType(manifest: TemplateManifest, type: WorkspaceType) {
  return manifest.workspaces.filter((workspace) => workspace.type === type)
}
