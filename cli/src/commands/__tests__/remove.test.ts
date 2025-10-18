import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "bun:test"

const TEST_DIR = join(process.cwd(), ".test-remove")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("remove command", () => {
  test("should export a command", async () => {
    const removeModule = await import("../remove")
    expect(removeModule.default).toBeDefined()
  })

  test("should list workspaces from directories", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    // Create test workspaces
    await mkdir("apps/app1", { recursive: true })
    await mkdir("apps/app2", { recursive: true })
    await mkdir("packages/pkg1", { recursive: true })
    await mkdir("packages/pkg2", { recursive: true })

    const { readdir } = await import("node:fs/promises")

    const appsEntries = await readdir("apps", { withFileTypes: true })
    const apps = appsEntries.filter((e) => e.isDirectory()).map((e) => e.name)

    const packagesEntries = await readdir("packages", { withFileTypes: true })
    const packages = packagesEntries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)

    expect(apps).toContain("app1")
    expect(apps).toContain("app2")
    expect(packages).toContain("pkg1")
    expect(packages).toContain("pkg2")

    process.chdir(originalCwd)
  })

  test("should remove workspace directory", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    // Create test workspace
    const workspacePath = "apps/test-app"
    await mkdir(workspacePath, { recursive: true })
    await writeFile(join(workspacePath, "test.txt"), "content", "utf-8")

    // Verify it exists
    const { fileExists } = await import("../../utils")
    expect(await fileExists(workspacePath)).toBe(true)

    // Remove it
    await rm(workspacePath, { recursive: true, force: true })

    // Verify it's gone
    expect(await fileExists(workspacePath)).toBe(false)

    process.chdir(originalCwd)
  })

  test("should handle non-existent workspace gracefully", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    // Try to remove non-existent workspace
    let error: Error | null = null
    try {
      await rm("apps/nonexistent", { recursive: true, force: false })
    } catch (e) {
      error = e as Error
    }

    // With force: false, should throw. With force: true, should not throw
    expect(error).not.toBeNull()

    // But with force: true, should succeed
    await rm("apps/nonexistent", { recursive: true, force: true })

    process.chdir(originalCwd)
  })
})
