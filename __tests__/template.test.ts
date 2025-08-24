import { describe, expect, test } from "bun:test"
import Bun from "bun"
import { workspaces } from "../scripts/template/utils"

describe("template configuration", () => {
  test("template version matches package.json version", async () => {
    // Read .template-version.json file
    const templateVersionFile = Bun.file(".template-version.json")
    const templateVersionData = await templateVersionFile.json()
    const templateVersion = templateVersionData["."]

    // Read package.json version
    const packageJsonFile = Bun.file("package.json")
    const packageJson = await packageJsonFile.json()
    const packageVersion = packageJson.version

    // Assert versions match
    expect(templateVersion).toBe(packageVersion)
  })

  test("workspace app dependencies match actual package.json dependencies", async () => {
    for (const app of workspaces.apps) {
      const packageJsonPath = `apps/${app.name}/package.json`
      const packageJsonFile = Bun.file(packageJsonPath)

      if (!(await packageJsonFile.exists())) {
        continue
      }

      const packageJson = await packageJsonFile.json()
      const dependencies = packageJson.dependencies || {}

      // Extract @init dependencies
      const actualDeps = Object.keys(dependencies)
        .filter((dep) => dep.startsWith("@init/"))
        .map((dep) => dep.replace("@init/", ""))
        .sort()

      // Compare with declared dependencies
      const declaredDeps = app.dependencies ? [...app.dependencies].sort() : []

      expect(actualDeps).toEqual(declaredDeps)
    }
  })

  test("all @init dependencies in apps are valid package names", async () => {
    const validPackageNames = workspaces.packages.map((pkg) => pkg.name)

    for (const app of workspaces.apps) {
      if (!app.dependencies) continue

      for (const dep of app.dependencies) {
        expect(validPackageNames).toContain(dep)
      }
    }
  })
})
