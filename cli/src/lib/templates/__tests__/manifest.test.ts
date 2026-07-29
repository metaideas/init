import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import { readManifest, validateManifest } from "#lib/templates/manifest.ts"
import { resolveSelection } from "#lib/workspaces/selection.ts"

let temporaryDirectory: string | undefined

afterEach(async () => {
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("readManifest", () => {
  test("parses a valid manifest from the template tree", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-manifest-"))
    const path = join(temporaryDirectory, "manifest.json")
    await writeFile(
      path,
      JSON.stringify({
        cleanupPaths: ["cli"],
        excludedPaths: ["node_modules"],
        workspaces: [
          {
            description: "App",
            dir: "apps/app",
            id: "app",
            name: "app",
            relationships: [],
            type: "app",
          },
        ],
      })
    )

    const manifest = await Effect.runPromise(
      readManifest(path).pipe(Effect.provide(BunServices.layer))
    )

    expect(manifest.workspaces[0]?.id).toBe("app")
  })

  test("explains missing manifests from old or already-configured snapshots", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-manifest-missing-"))
    const error = await Effect.runPromise(
      Effect.flip(
        readManifest(join(temporaryDirectory, "manifest.json")).pipe(
          Effect.provide(BunServices.layer)
        )
      )
    )

    expect(error._tag).toBe("ManifestReadFailed")
    expect(error.message).toContain("bunx init-now@latest")
  })

  test("rejects duplicate ids and recommendations without reasons", () => {
    const workspace = {
      description: "App",
      dir: "apps/app",
      id: "app",
      name: "app",
      relationships: [{ kind: "recommended" as const, target: "app" }],
      type: "app" as const,
    }
    const errors = validateManifest({
      cleanupPaths: [],
      excludedPaths: [],
      workspaces: [workspace, { ...workspace, dir: "apps/other", name: "other" }],
    })

    expect(errors).toContain("Duplicate workspace id: app")
    expect(errors).toContain("app recommendation for app requires a reason")
  })

  test("the committed graph keeps app, api, and backend independent", async () => {
    const rootManifestPath = join(import.meta.dir, "../../../../../manifest.json")
    const manifest = await Effect.runPromise(
      readManifest(rootManifestPath).pipe(Effect.provide(BunServices.layer))
    )

    const appPlan = resolveSelection(manifest, new Set(["app"]))
    const apiPlan = resolveSelection(manifest, new Set(["api"]))
    const backendPlan = resolveSelection(manifest, new Set(["backend"]))

    expect(appPlan.selected.has("api")).toBe(false)
    expect(appPlan.selected.has("backend")).toBe(false)
    expect(apiPlan.selected.has("app")).toBe(false)
    expect(apiPlan.selected.has("backend")).toBe(false)
    expect(backendPlan.selected.has("app")).toBe(false)
    expect(backendPlan.selected.has("api")).toBe(false)
    expect(apiPlan.selected.has("db")).toBe(true)
    expect(apiPlan.selected.has("env")).toBe(true)
    expect(apiPlan.selected.has("observability")).toBe(true)
    expect(apiPlan.selected.has("tooling-tsconfig")).toBe(true)
    expect(apiPlan.selected.has("utils")).toBe(true)
    expect(
      manifest.workspaces
        .find((workspace) => workspace.id === "native-ui")
        ?.relationships.find((relationship) => relationship.target === "mobile")
    ).toMatchObject({ kind: "recommended" })
  })
})
