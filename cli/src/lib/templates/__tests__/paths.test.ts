import { describe, expect, test } from "bun:test"
import { checkIsInternalPath } from "#lib/templates/paths.ts"

const internalPaths = [
  "cli",
  ".github/workflows/cli.yml",
  ".github/workflows/release.yml",
  "release-please-config.json",
  ".plans",
]

describe("checkIsInternalPath", () => {
  test("matches configured paths and their descendants", () => {
    expect(checkIsInternalPath("cli/src/index.ts", internalPaths)).toBe(true)
    expect(checkIsInternalPath(".plans/09-cli-effect-v4-and-tooling.md", internalPaths)).toBe(true)
    expect(checkIsInternalPath("apps/app/src/index.ts", internalPaths)).toBe(false)
  })
})
