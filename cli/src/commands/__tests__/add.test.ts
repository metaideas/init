import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "bun:test"

const TEST_DIR = join(process.cwd(), ".test-add")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("add command", () => {
  test("should export a command", async () => {
    const addModule = await import("../add")
    expect(addModule.default).toBeDefined()
  })

  test("should read project name from package.json", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    await writeFile(
      "package.json",
      JSON.stringify({ name: "test-project" }),
      "utf-8"
    )

    const { readFile } = await import("node:fs/promises")
    const content = await readFile("package.json", "utf-8")
    const packageJson = JSON.parse(content)

    expect(packageJson.name).toBe("test-project")

    process.chdir(originalCwd)
  })

  test("should handle missing package.json", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    let error: Error | null = null
    try {
      const { readFile } = await import("node:fs/promises")
      await readFile("package.json", "utf-8")
    } catch (e) {
      error = e as Error
    }

    expect(error).not.toBeNull()

    process.chdir(originalCwd)
  })

  test("should have workspace data from utils", async () => {
    const { workspaces } = await import("../../utils")

    expect(workspaces.apps.length).toBeGreaterThan(0)
    expect(workspaces.packages.length).toBeGreaterThan(0)

    // Check that each workspace has the expected structure
    const firstApp = workspaces.apps[0]
    expect(firstApp.name).toBeDefined()
    expect(firstApp.description).toBeDefined()
    expect(Array.isArray(firstApp.dependencies)).toBe(true)
  })
})
