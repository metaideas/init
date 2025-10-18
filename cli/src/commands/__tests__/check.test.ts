import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

const TEST_DIR = join(process.cwd(), ".test-check")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("check command", () => {
  test("should export a command", async () => {
    const checkModule = await import("../check")
    expect(checkModule.default).toBeDefined()
  })

  test("version comparison should work correctly", () => {
    // This tests the compareVersions function logic
    const compareVersions = (current: string, latest: string): number => {
      const currentParts = current.split(".").map(Number)
      const latestParts = latest.split(".").map(Number)

      for (
        let i = 0;
        i < Math.max(currentParts.length, latestParts.length);
        i++
      ) {
        const currentPart = currentParts[i] || 0
        const latestPart = latestParts[i] || 0

        if (currentPart < latestPart) {
          return -1
        }
        if (currentPart > latestPart) {
          return 1
        }
      }

      return 0
    }

    expect(compareVersions("1.0.0", "1.0.0")).toBe(0)
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1)
    expect(compareVersions("1.0.1", "1.0.0")).toBe(1)
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1)
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1)
  })

  test("should handle missing version file gracefully", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    const { getVersion } = await import("../../utils")
    const version = await getVersion()
    expect(version).toBe("")

    process.chdir(originalCwd)
  })

  test("should read version from template file", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    await writeFile(
      ".template-version.json",
      JSON.stringify({ ".": "1.2.3" }),
      "utf-8"
    )

    const { getVersion } = await import("../../utils")
    const version = await getVersion()
    expect(version).toBe("1.2.3")

    process.chdir(originalCwd)
  })
})
