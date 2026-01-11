import { describe, expect, test } from "bun:test"
import * as Bun from "bun"
import { workspaces } from "#workspaces.ts"

const rootDir = new URL("../../../", import.meta.url)

describe("cli workspaces configuration", () => {
  test("template version matches repo package.json", async () => {
    const templateVersionFile = Bun.file(new URL(".template-version.json", rootDir))
    const templateVersionData = await templateVersionFile.json()
    const templateVersion = templateVersionData["."]

    const packageJsonFile = Bun.file(new URL("package.json", rootDir))
    const packageJson = await packageJsonFile.json()
    const packageVersion = packageJson.version

    expect(templateVersion).toBe(packageVersion)
  })

  test("app dependencies match declared workspaces", async () => {
    const checks = await Promise.all(
      workspaces.apps.map(async (app) => {
        const packageJsonFile = Bun.file(new URL(`apps/${app.name}/package.json`, rootDir))

        if (!(await packageJsonFile.exists())) {
          return null
        }

        const packageJson = await packageJsonFile.json()
        const dependencies = packageJson.dependencies ?? {}

        const actualDeps = Object.keys(dependencies as object)
          .filter((dep) => dep.startsWith("@init/"))
          .map((dep) => dep.replace("@init/", ""))
          .toSorted((a, b) => a.localeCompare(b))

        const declaredDeps = app.dependencies
          ? [...app.dependencies].toSorted((a, b) => a.localeCompare(b))
          : []

        return { actualDeps, declaredDeps }
      })
    )

    for (const check of checks) {
      if (check) {
        expect(check.actualDeps).toEqual(check.declaredDeps)
      }
    }
  })

  test("app dependencies are valid package names", () => {
    const validPackageNames = workspaces.packages.map((pkg) => pkg.name)

    for (const app of workspaces.apps) {
      if (!app.dependencies) {
        continue
      }

      for (const dep of app.dependencies) {
        expect(validPackageNames).toContain(dep)
      }
    }
  })
})
