import { describe, expect, test } from "bun:test"
import { getCompatibilityWarning } from "#lib/templates/compatibility.ts"

describe("getCompatibilityWarning", () => {
  test("warns when the CLI major version is older than the template", () => {
    expect(getCompatibilityWarning("1.3.0", "2.0.0")).toContain("bunx init-now@latest")
  })

  test("does not warn when the CLI and template share a major version", () => {
    expect(getCompatibilityWarning("2.0.2", "2.3.0")).toBeUndefined()
  })

  test("does not warn when the CLI major version is newer than the template", () => {
    expect(getCompatibilityWarning("2.0.2", "1.3.0")).toBeUndefined()
  })
})
