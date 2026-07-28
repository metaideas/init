import { describe, expect, test } from "bun:test"
import { checkIsInternalPath, internalPaths } from "#lib/shared/internal-paths.ts"

describe("internalPaths", () => {
  test("covers files that must not leak into scaffolded projects", () => {
    expect(internalPaths).toContain("cli")
    expect(internalPaths).toContain(".github/workflows/cli.yml")
    expect(internalPaths).toContain(".github/workflows/release.yml")
    expect(internalPaths).toContain("release-please-config.json")
    expect(internalPaths).toContain(".plans")
  })

  test("matches descendants of internal directories", () => {
    expect(checkIsInternalPath("cli/src/index.ts")).toBe(true)
    expect(checkIsInternalPath(".plans/09-cli-effect-v4-and-tooling.md")).toBe(true)
    expect(checkIsInternalPath("apps/app/src/index.ts")).toBe(false)
  })
})
