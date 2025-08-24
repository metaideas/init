import { expect, test } from "bun:test"
import Bun from "bun"

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
