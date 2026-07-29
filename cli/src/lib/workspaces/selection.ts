import type { TemplateManifest, WorkspaceRelationship } from "#lib/templates/manifest.ts"

export type RequiredReason = {
  readonly chain: readonly string[]
  readonly source: string
  readonly target: string
}

export type RecommendationOmission = {
  readonly dependencySection?: WorkspaceRelationship["dependencySection"]
  readonly reason: string
  readonly source: string
  readonly target: string
}

export type SelectionPlan = {
  readonly dangling: readonly string[]
  readonly manifestEdits: readonly RecommendationOmission[]
  readonly recommendations: readonly RecommendationOmission[]
  readonly requiredReasons: ReadonlyMap<string, RequiredReason>
  readonly selected: ReadonlySet<string>
}

export function resolveSelection(
  manifest: TemplateManifest,
  explicitlySelected: ReadonlySet<string>
): SelectionPlan {
  const workspaceById = new Map(manifest.workspaces.map((workspace) => [workspace.id, workspace]))
  const selected = new Set(explicitlySelected)
  const requiredReasons = new Map<string, RequiredReason>()
  const dangling: string[] = []
  const queue = [...explicitlySelected].map((id) => ({ chain: [id], id }))

  for (const id of explicitlySelected) {
    if (!workspaceById.has(id)) dangling.push(`Unknown selected workspace: ${id}`)
  }

  for (const current of queue) {
    const workspace = workspaceById.get(current.id)
    if (!workspace) continue

    for (const relationship of workspace.relationships) {
      if (!workspaceById.has(relationship.target)) {
        dangling.push(`${workspace.id} references unknown workspace ${relationship.target}`)
        continue
      }
      if (relationship.kind !== "required" || selected.has(relationship.target)) continue

      const chain = [...current.chain, relationship.target]
      selected.add(relationship.target)
      requiredReasons.set(relationship.target, {
        chain,
        source: workspace.id,
        target: relationship.target,
      })
      queue.push({ chain, id: relationship.target })
    }
  }

  const recommendations = manifest.workspaces.flatMap((workspace) => {
    if (!selected.has(workspace.id)) return []

    return workspace.relationships.flatMap((relationship) => {
      if (relationship.kind !== "recommended" || selected.has(relationship.target)) return []

      return [
        {
          ...(relationship.dependencySection
            ? { dependencySection: relationship.dependencySection }
            : {}),
          reason: relationship.reason ?? "",
          source: workspace.id,
          target: relationship.target,
        },
      ]
    })
  })

  return {
    dangling,
    manifestEdits: recommendations.filter(
      (recommendation) => recommendation.dependencySection !== undefined
    ),
    recommendations,
    requiredReasons,
    selected,
  }
}

export function parseWorkspaceList(value: string | undefined) {
  if (value === undefined) return
  if (!value.trim()) return []
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ]
}
