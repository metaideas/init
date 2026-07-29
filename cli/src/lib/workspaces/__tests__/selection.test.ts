import { describe, expect, test } from "bun:test"
import type { ManifestWorkspace, TemplateManifest } from "#lib/templates/manifest.ts"
import { resolveSelection } from "#lib/workspaces/selection.ts"

function createManifest(workspaces: readonly ManifestWorkspace[]): TemplateManifest {
  return { cleanupPaths: [], excludedPaths: [], workspaces }
}

function createWorkspace(
  id: string,
  relationships: ManifestWorkspace["relationships"] = [],
  type: ManifestWorkspace["type"] = "package"
): ManifestWorkspace {
  return {
    description: id,
    dir: `${type}s/${id}`,
    id,
    name: type === "app" ? id : `@init/${id}`,
    relationships,
    type,
  }
}

describe("resolveSelection", () => {
  test("resolves an arbitrary transitive required graph with reason chains", () => {
    const manifest = createManifest([
      createWorkspace("web", [{ kind: "required", target: "auth" }], "app"),
      createWorkspace("auth", [{ kind: "required", target: "db" }]),
      createWorkspace("db", [{ kind: "required", target: "utils" }]),
      createWorkspace("utils"),
    ])

    const plan = resolveSelection(manifest, new Set(["web"]))

    expect([...plan.selected]).toEqual(["web", "auth", "db", "utils"])
    expect(plan.requiredReasons.get("utils")?.chain).toEqual(["web", "auth", "db", "utils"])
  })

  test("handles required cycles without looping", () => {
    const manifest = createManifest([
      createWorkspace("a", [{ kind: "required", target: "b" }]),
      createWorkspace("b", [{ kind: "required", target: "a" }]),
    ])

    expect([...resolveSelection(manifest, new Set(["a"])).selected]).toEqual(["a", "b"])
  })

  test("groups omitted recommendations and plans dependency removal", () => {
    const manifest = createManifest([
      createWorkspace("app", [
        {
          dependencySection: "dependencies",
          kind: "recommended",
          reason: "Remote calls require the API.",
          target: "api",
        },
        {
          kind: "recommended",
          reason: "Background work is faster with a worker.",
          target: "worker",
        },
      ]),
      createWorkspace("api", [], "app"),
      createWorkspace("worker", [], "app"),
    ])

    const plan = resolveSelection(manifest, new Set(["app"]))

    expect(plan.recommendations).toHaveLength(2)
    expect(plan.manifestEdits).toEqual([
      {
        dependencySection: "dependencies",
        reason: "Remote calls require the API.",
        source: "app",
        target: "api",
      },
    ])
    expect(plan.selected.has("api")).toBe(false)
    expect(plan.selected.has("worker")).toBe(false)
  })

  test("recommendation cycles never force selection", () => {
    const manifest = createManifest([
      createWorkspace("a", [{ kind: "recommended", reason: "Use b when needed.", target: "b" }]),
      createWorkspace("b", [{ kind: "recommended", reason: "Use a when needed.", target: "a" }]),
    ])

    const plan = resolveSelection(manifest, new Set(["a"]))

    expect([...plan.selected]).toEqual(["a"])
    expect(plan.recommendations.map(({ target }) => target)).toEqual(["b"])
  })

  test("reports unknown selections and relationship targets", () => {
    const manifest = createManifest([
      createWorkspace("a", [{ kind: "required", target: "missing" }]),
    ])

    const plan = resolveSelection(manifest, new Set(["a", "unknown"]))

    expect(plan.dangling).toEqual([
      "Unknown selected workspace: unknown",
      "a references unknown workspace missing",
    ])
  })
})
