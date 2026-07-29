import { describe, expect, test } from "bun:test"
import * as Bun from "bun"
import { workspaces } from "#lib/shared/workspaces.ts"

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

        const declaredDeps = [...app.dependencies].toSorted((a, b) => a.localeCompare(b))

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
      for (const dep of app.dependencies) {
        expect(validPackageNames).toContain(dep)
      }
    }
  })

  test("package inventory matches package workspaces", async () => {
    const packageJsonPaths = await Array.fromAsync(
      new Bun.Glob("packages/*/package.json").scan({ cwd: rootDir.pathname })
    )
    const actualPackageNames = await Promise.all(
      packageJsonPaths.map(async (packageJsonPath) => {
        const packageJson = await Bun.file(new URL(packageJsonPath, rootDir)).json()
        return (packageJson.name as string).replace("@init/", "")
      })
    )

    expect(workspaces.packages.map((pkg) => pkg.name).toSorted()).toEqual(
      actualPackageNames.toSorted()
    )
  })
})
