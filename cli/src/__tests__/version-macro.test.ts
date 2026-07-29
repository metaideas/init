import { describe, expect, test } from "bun:test"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }
import packageJson from "../../package.json" with { type: "json" }

describe("getPackageVersion", () => {
  test("matches package.json", () => {
    expect(getPackageVersion()).toBe(packageJson.version)
  })
})
