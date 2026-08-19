import { join, resolve } from "node:path"
import { defineCommand } from "citty"
import consola from "consola"

import { updatePortlessProjectName } from "./portless"
import {
  checkIsPathWithinRoot,
  getProjectScope,
  getScopePrefix,
  normalizeScope,
  readJson,
  replaceTextInFiles,
  writeJson,
} from "./shared"

export type RenameOptions = {
  projectName?: string
  rootDir: string
  scope: string
  sourceScope: string
}

export type RenameResult = {
  changedFiles: string[]
}

export async function renameProject({
  rootDir,
  projectName,
  scope,
  sourceScope,
}: RenameOptions): Promise<RenameResult> {
  const normalizedScope = normalizeScope(scope)
  const normalizedSourceScope = normalizeScope(sourceScope)
  const changedFiles = new Set(
    await replaceTextInFiles(
      rootDir,
      getScopePrefix(normalizedSourceScope),
      getScopePrefix(normalizedScope)
    )
  )

  for (const path of await replaceTextInFiles(
    rootDir,
    `${normalizedSourceScope}.localhost`,
    `${normalizedScope}.localhost`
  ))
    changedFiles.add(path)

  if (!projectName) return { changedFiles: [...changedFiles] }

  for (const path of await updatePortlessProjectName(rootDir, normalizedScope))
    changedFiles.add(path)

  const packageJsonPath = join(rootDir, "package.json")
  const packageJson = await readJson(packageJsonPath)
  if (packageJson.name !== projectName) {
    packageJson.name = projectName
    await writeJson(packageJsonPath, packageJson)
    changedFiles.add(packageJsonPath)
  }

  return { changedFiles: [...changedFiles] }
}

export default defineCommand({
  args: {
    name: {
      description: "New root package name",
      type: "string",
    },
    scope: {
      description: "New npm scope, without the leading @ (defaults to --name)",
      type: "string",
    },
    workspace: {
      description: "Rewrite only this workspace directory",
      type: "string",
    },
  },
  meta: {
    description: "Rename the project and replace the template workspace scope",
    name: "rename",
  },
  run: async ({ args }) => {
    const projectRoot = resolve(process.cwd())
    const projectName = args.name
    if (!args.workspace && !projectName) {
      throw new Error("Provide --name when you rename a project.")
    }

    const scope = args.scope ?? projectName
    if (!scope) {
      throw new Error("Provide --scope when you rename a workspace.")
    }

    const rootDir = args.workspace ? resolve(projectRoot, args.workspace) : projectRoot
    if (args.workspace && !checkIsPathWithinRoot(projectRoot, rootDir)) {
      throw new Error(`Workspace path must be inside the project: ${rootDir}.`)
    }
    if (!(await Bun.file(join(rootDir, "package.json")).exists())) {
      throw new Error(`Workspace path must contain a package.json file: ${rootDir}.`)
    }

    const result = await renameProject({
      projectName: args.workspace ? undefined : projectName,
      rootDir,
      scope,
      sourceScope: await getProjectScope(projectRoot),
    })

    if (result.changedFiles.length === 0) consola.info("Nothing to rename.")
    else consola.info(`Renamed ${result.changedFiles.length} file(s).`)
  },
})
