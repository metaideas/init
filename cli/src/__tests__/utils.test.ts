import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  executeCommand,
  fileExists,
  getAllFiles,
  getVersion,
  replaceProjectNameInProjectFiles,
  workspaces,
} from "../utils"

const TEST_DIR = join(process.cwd(), ".test-utils")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("workspaces", () => {
  test("should have apps defined", () => {
    expect(workspaces.apps).toBeDefined()
    expect(workspaces.apps.length).toBeGreaterThan(0)
  })

  test("should have packages defined", () => {
    expect(workspaces.packages).toBeDefined()
    expect(workspaces.packages.length).toBeGreaterThan(0)
  })

  test("each app should have required properties", () => {
    for (const app of workspaces.apps) {
      expect(app.name).toBeDefined()
      expect(app.description).toBeDefined()
      expect(app.dependencies).toBeDefined()
      expect(Array.isArray(app.dependencies)).toBe(true)
    }
  })

  test("each package should have required properties", () => {
    for (const pkg of workspaces.packages) {
      expect(pkg.name).toBeDefined()
      expect(pkg.description).toBeDefined()
      expect(pkg.dependencies).toBeDefined()
      expect(Array.isArray(pkg.dependencies)).toBe(true)
    }
  })
})

describe("fileExists", () => {
  test("should return true for existing file", async () => {
    const testFile = join(TEST_DIR, "test.txt")
    await writeFile(testFile, "content", "utf-8")

    const exists = await fileExists(testFile)
    expect(exists).toBe(true)
  })

  test("should return false for non-existing file", async () => {
    const testFile = join(TEST_DIR, "nonexistent.txt")

    const exists = await fileExists(testFile)
    expect(exists).toBe(false)
  })
})

describe("getAllFiles", () => {
  test("should return array of files", async () => {
    await writeFile(join(TEST_DIR, "file1.txt"), "content", "utf-8")
    await writeFile(join(TEST_DIR, "file2.txt"), "content", "utf-8")

    const files = await getAllFiles(TEST_DIR)
    expect(Array.isArray(files)).toBe(true)
    expect(files.length).toBeGreaterThanOrEqual(2)
  })

  test("should exclude node_modules", async () => {
    await mkdir(join(TEST_DIR, "node_modules"), { recursive: true })
    await writeFile(
      join(TEST_DIR, "node_modules", "test.txt"),
      "content",
      "utf-8"
    )
    await writeFile(join(TEST_DIR, "file.txt"), "content", "utf-8")

    const files = await getAllFiles(TEST_DIR)
    const hasNodeModules = files.some((f) => f.includes("node_modules"))
    expect(hasNodeModules).toBe(false)
  })
})

describe("getVersion", () => {
  test("should return empty string when version file doesn't exist", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    const version = await getVersion()
    expect(version).toBe("")

    process.chdir(originalCwd)
  })

  test("should return version from .template-version.json", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    await writeFile(
      ".template-version.json",
      JSON.stringify({ ".": "1.0.0" }),
      "utf-8"
    )

    const version = await getVersion()
    expect(version).toBe("1.0.0")

    process.chdir(originalCwd)
  })
})

describe("replaceProjectNameInProjectFiles", () => {
  test("should replace @init with project name", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    const testFile = "test.ts"
    await writeFile(testFile, 'import { foo } from "@init/utils"', "utf-8")

    await replaceProjectNameInProjectFiles("myproject")

    const { readFile } = await import("node:fs/promises")
    const content = await readFile(testFile, "utf-8")
    expect(content).toBe('import { foo } from "@myproject/utils"')

    process.chdir(originalCwd)
  })

  test("should not modify files without @init", async () => {
    const originalCwd = process.cwd()
    process.chdir(TEST_DIR)

    const testFile = "test.ts"
    const originalContent = 'import { foo } from "@other/utils"'
    await writeFile(testFile, originalContent, "utf-8")

    await replaceProjectNameInProjectFiles("myproject")

    const { readFile } = await import("node:fs/promises")
    const content = await readFile(testFile, "utf-8")
    expect(content).toBe(originalContent)

    process.chdir(originalCwd)
  })
})

describe("executeCommand", () => {
  test("should execute simple command", async () => {
    const result = await executeCommand("echo hello")
    expect(result.trim()).toBe("hello")
  })

  test("should throw on failed command", async () => {
    await expect(async () => {
      await executeCommand("exit 1")
    }).toThrow()
  })
})
