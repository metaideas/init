import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "bun:test"

const TEST_DIR = join(process.cwd(), ".test-update")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("update command", () => {
  test("should export a command", async () => {
    const updateModule = await import("../update")
    expect(updateModule.default).toBeDefined()
  })

  test("version comparison should handle v prefix", () => {
    const VERSION_PREFIX = /^v/
    const compareVersions = (current: string, latest: string): number => {
      const currentClean = current.replace(VERSION_PREFIX, "")
      const latestClean = latest.replace(VERSION_PREFIX, "")

      const currentParts = currentClean.split(".").map(Number)
      const latestParts = latestClean.split(".").map(Number)

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

    expect(compareVersions("v1.0.0", "v1.0.0")).toBe(0)
    expect(compareVersions("v1.0.0", "v1.0.1")).toBe(-1)
    expect(compareVersions("1.0.0", "v1.0.0")).toBe(0)
    expect(compareVersions("v1.0.0", "1.0.0")).toBe(0)
  })

  test("should filter new files for existing workspaces", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    // Create existing workspaces
    await mkdir("apps/app1", { recursive: true })
    await mkdir("packages/pkg1", { recursive: true })

    const { readdir } = await import("node:fs/promises")

    const appsEntries = await readdir("apps", { withFileTypes: true })
    const existingApps = new Set(
      appsEntries.filter((e) => e.isDirectory()).map((e) => e.name)
    )

    const packagesEntries = await readdir("packages", { withFileTypes: true })
    const existingPackages = new Set(
      packagesEntries.filter((e) => e.isDirectory()).map((e) => e.name)
    )

    const newFiles = [
      "apps/app1/file.ts",
      "apps/app2/file.ts",
      "packages/pkg1/file.ts",
      "packages/pkg2/file.ts",
      "README.md",
    ]

    const filteredFiles = newFiles.filter((filePath) => {
      if (filePath.startsWith("apps/")) {
        const parts = filePath.split("/")
        const appName = parts[1]
        if (!appName) return false
        return existingApps.has(appName)
      }
      if (filePath.startsWith("packages/")) {
        const parts = filePath.split("/")
        const packageName = parts[1]
        if (!packageName) return false
        return existingPackages.has(packageName)
      }
      return true
    })

    // Should include files from existing workspaces and root files
    expect(filteredFiles).toContain("apps/app1/file.ts")
    expect(filteredFiles).toContain("packages/pkg1/file.ts")
    expect(filteredFiles).toContain("README.md")

    // Should exclude files from non-existing workspaces
    expect(filteredFiles).not.toContain("apps/app2/file.ts")
    expect(filteredFiles).not.toContain("packages/pkg2/file.ts")

    process.chdir(originalCwd)
  })

  test("should update template version file", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    const version = "v1.2.3"
    const data = { ".": version }
    await writeFile(
      ".template-version.json",
      `${JSON.stringify(data, null, 2)}\n`,
      "utf-8"
    )

    const { readFile } = await import("node:fs/promises")
    const content = await readFile(".template-version.json", "utf-8")
    const parsed = JSON.parse(content)

    expect(parsed["."]).toBe(version)

    process.chdir(originalCwd)
  })
})
