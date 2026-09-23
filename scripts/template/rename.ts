import { join } from "node:path"

import { getScopePrefix, normalizeScope, readJson, replaceTextInFiles, writeJson } from "./shared"

export type RenameOptions = {
  projectName?: string
  rootDir: string
  scope: string
  sourceScope: string
}

export async function renameProject({ rootDir, projectName, scope, sourceScope }: RenameOptions) {
  const changedFiles = new Set(
    await replaceTextInFiles(
      rootDir,
      getScopePrefix(normalizeScope(sourceScope)),
      getScopePrefix(normalizeScope(scope))
    )
  )

  if (!projectName) return { changedFiles: [...changedFiles] }

  const packageJsonPath = join(rootDir, "package.json")
  const packageJson = await readJson(packageJsonPath)
  if (packageJson.name !== projectName) {
    packageJson.name = projectName
    await writeJson(packageJsonPath, packageJson)
    changedFiles.add(packageJsonPath)
  }

  return { changedFiles: [...changedFiles] }
}
