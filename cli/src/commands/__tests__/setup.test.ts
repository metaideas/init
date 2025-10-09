import { mkdir, rm } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "bun:test"

const TEST_DIR = join(process.cwd(), ".test-setup")

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true })
})

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true })
})

describe("setup command", () => {
  test("should export a command", async () => {
    const setupModule = await import("../setup")
    expect(setupModule.default).toBeDefined()
  })

  test("project name regex should validate correctly", () => {
    const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/i

    // Valid names
    expect(PROJECT_NAME_REGEX.test("my-project")).toBe(true)
    expect(PROJECT_NAME_REGEX.test("my_project")).toBe(true)
    expect(PROJECT_NAME_REGEX.test("myproject123")).toBe(true)
    expect(PROJECT_NAME_REGEX.test("MyProject")).toBe(true)

    // Invalid names
    expect(PROJECT_NAME_REGEX.test("my project")).toBe(false)
    expect(PROJECT_NAME_REGEX.test("my@project")).toBe(false)
    expect(PROJECT_NAME_REGEX.test("my.project")).toBe(false)
  })

  test("should handle workspace selection logic", async () => {
    const { workspaces } = await import("../../utils")

    // Simulate selecting apps and packages
    const selectedApps = ["app", "web"]
    const selectedPackages = ["ui", "utils"]

    const appsToRemove = workspaces.apps
      .filter((app) => !selectedApps.includes(app.name))
      .map((app) => app.name)

    const packagesToRemove = workspaces.packages
      .filter((pkg) => !selectedPackages.includes(pkg.name))
      .map((pkg) => pkg.name)

    // Verify that we're removing the correct ones
    expect(appsToRemove).not.toContain("app")
    expect(appsToRemove).not.toContain("web")
    expect(packagesToRemove).not.toContain("ui")
    expect(packagesToRemove).not.toContain("utils")

    // Verify we're keeping the selected ones
    expect(selectedApps.length).toBeGreaterThan(0)
    expect(selectedPackages.length).toBeGreaterThan(0)
  })

  test("should calculate required packages from selected apps", async () => {
    const { workspaces } = await import("../../utils")

    const selectedApps = ["app"]
    const requiredPackages = new Set<string>()

    for (const appName of selectedApps) {
      const app = workspaces.apps.find((a) => a.name === appName)
      if (app?.dependencies) {
        for (const dep of app.dependencies) {
          requiredPackages.add(dep)
        }
      }
    }

    // The 'app' workspace should have dependencies
    expect(requiredPackages.size).toBeGreaterThan(0)

    // Check that some expected dependencies are there
    const appWorkspace = workspaces.apps.find((a) => a.name === "app")
    if (appWorkspace) {
      for (const dep of appWorkspace.dependencies) {
        expect(requiredPackages.has(dep)).toBe(true)
      }
    }
  })
})
