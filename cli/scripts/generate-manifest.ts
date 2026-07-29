import { fileURLToPath } from "node:url"
import * as BunRuntime from "@effect/platform-bun/BunRuntime"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import type {
  ManifestWorkspace,
  TemplateManifest,
  WorkspaceRelationship,
  WorkspaceType,
} from "../src/lib/templates/manifest.ts"
import { validateManifest } from "../src/lib/templates/manifest.ts"

const DependencyRecordSchema = Schema.Record(Schema.String, Schema.String)
const RelationshipOverrideSchema = Schema.Struct({
  kind: Schema.Literals(["required", "recommended"]),
  reason: Schema.optionalKey(Schema.String),
})
const PackageMetadataSchema = Schema.Struct({
  dependencies: Schema.optionalKey(DependencyRecordSchema),
  description: Schema.String,
  devDependencies: Schema.optionalKey(DependencyRecordSchema),
  init: Schema.optionalKey(
    Schema.Struct({
      relationships: Schema.optionalKey(Schema.Record(Schema.String, RelationshipOverrideSchema)),
    })
  ),
  name: Schema.String,
  optionalDependencies: Schema.optionalKey(DependencyRecordSchema),
  peerDependencies: Schema.optionalKey(DependencyRecordSchema),
})
const RootMetadataSchema = Schema.Struct({
  init: Schema.Struct({
    cleanupPaths: Schema.Array(Schema.String),
    excludedPaths: Schema.Array(Schema.String),
  }),
})

type PackageMetadata = typeof PackageMetadataSchema.Type
type RelationshipOverride = typeof RelationshipOverrideSchema.Type

const rootDirectory = fileURLToPath(new URL("../..", import.meta.url))
const workspaceRoots = [
  ["apps", "app"],
  ["packages", "package"],
  ["tooling", "tooling"],
] as const satisfies ReadonlyArray<readonly [string, WorkspaceType]>
const dependencySections = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const

function getWorkspaceId(name: string, type: WorkspaceType) {
  const separatorIndex = name.lastIndexOf("/")
  const shortName = separatorIndex === -1 ? name : name.slice(separatorIndex + 1)
  return type === "tooling" ? `tooling-${shortName}` : shortName
}

function getRelationshipOverride(
  metadata: PackageMetadata,
  id: string,
  name: string
): RelationshipOverride | undefined {
  return metadata.init?.relationships?.[id] ?? metadata.init?.relationships?.[name]
}

function createRelationship(
  targetId: string,
  dependencySection: WorkspaceRelationship["dependencySection"],
  override: RelationshipOverride | undefined
): WorkspaceRelationship {
  const kind = override?.kind ?? "required"
  return {
    dependencySection,
    kind,
    ...(override?.reason ? { reason: override.reason } : {}),
    target: targetId,
  }
}

const generateManifest = Effect.fn("generateManifest")(function* () {
  const fs = yield* FileSystem.FileSystem
  const metadataByDir = new Map<string, PackageMetadata>()
  const workspaceTypes = new Map<string, WorkspaceType>()

  for (const [workspaceRoot, type] of workspaceRoots) {
    const entries = yield* fs.readDirectory(`${rootDirectory}/${workspaceRoot}`)
    for (const entry of entries.toSorted()) {
      const dir = `${workspaceRoot}/${entry}`
      const info = yield* fs.stat(`${rootDirectory}/${dir}`)
      if (info.type !== "Directory") continue
      const packageJsonPath = `${rootDirectory}/${dir}/package.json`
      if (!(yield* fs.exists(packageJsonPath))) continue
      const metadata = yield* Schema.decodeUnknownEffect(
        Schema.fromJsonString(PackageMetadataSchema)
      )(yield* fs.readFileString(packageJsonPath))
      metadataByDir.set(dir, metadata)
      workspaceTypes.set(dir, type)
    }
  }

  const workspaceInfos = [...metadataByDir.entries()].map(([dir, metadata]) => {
    const type = workspaceTypes.get(dir) ?? "package"
    return { dir, id: getWorkspaceId(metadata.name, type), metadata, name: metadata.name, type }
  })
  const infoByName = new Map(workspaceInfos.map((info) => [info.name, info]))
  const infoById = new Map(workspaceInfos.map((info) => [info.id, info]))

  const workspaces: ManifestWorkspace[] = workspaceInfos.map((info) => {
    const { metadata } = info
    const relationships: WorkspaceRelationship[] = []

    for (const dependencySection of dependencySections) {
      const dependencies = metadata[dependencySection] ?? {}
      for (const [dependencyName, version] of Object.entries(dependencies)) {
        if (!version.startsWith("workspace:")) continue
        const target = infoByName.get(dependencyName)
        if (!target) {
          throw new Error(
            `${info.name} has a workspace dependency on unknown package ${dependencyName}`
          )
        }
        relationships.push(
          createRelationship(
            target.id,
            dependencySection,
            getRelationshipOverride(metadata, target.id, target.name)
          )
        )
      }
    }

    for (const [targetName, override] of Object.entries(metadata.init?.relationships ?? {})) {
      const target = infoById.get(targetName) ?? infoByName.get(targetName)
      if (!target) throw new Error(`${info.name} recommends unknown workspace ${targetName}`)
      if (relationships.some((relationship) => relationship.target === target.id)) continue
      relationships.push({
        kind: override.kind,
        ...(override.reason ? { reason: override.reason } : {}),
        target: target.id,
      })
    }

    return {
      description: metadata.description,
      dir: info.dir,
      id: info.id,
      name: info.name,
      relationships: relationships.toSorted((left, right) =>
        left.target.localeCompare(right.target)
      ),
      type: info.type,
    }
  })

  const rootMetadata = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(RootMetadataSchema))(
    yield* fs.readFileString(`${rootDirectory}/package.json`)
  )
  const manifest: TemplateManifest = {
    cleanupPaths: rootMetadata.init.cleanupPaths,
    excludedPaths: rootMetadata.init.excludedPaths,
    workspaces,
  }
  const errors = validateManifest(manifest)
  if (errors.length > 0) throw new Error(errors.join("\n"))

  yield* fs.writeFileString(
    `${rootDirectory}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`
  )
})

BunRuntime.runMain(generateManifest().pipe(Effect.provide(BunServices.layer)))
