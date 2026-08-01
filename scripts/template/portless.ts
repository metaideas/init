import { join, relative } from "node:path"

import { getWorkspaces, readJson, writeJson } from "./shared"

export function getWorkspaceRouteName(workspacePath: string, projectName: string) {
  const normalizedWorkspacePath = workspacePath.replaceAll("\\", "/")
  if (normalizedWorkspacePath === "apps/app") return projectName

  const workspaceName = normalizedWorkspacePath.split("/").at(-1)
  return workspaceName ? `${workspaceName}.${projectName}` : projectName
}

async function updateWorkspacePackageName(
  rootDir: string,
  workspacePath: string,
  projectName: string
) {
  const packageJsonPath = join(rootDir, workspacePath, "package.json")
  if (!(await Bun.file(packageJsonPath).exists())) return null

  const packageJson = await readJson(packageJsonPath)
  const portless = packageJson.portless as { name?: string } | undefined
  if (!portless) return null

  const routeName = getWorkspaceRouteName(workspacePath, projectName)
  if (portless.name === routeName) return null

  portless.name = routeName
  await writeJson(packageJsonPath, packageJson)

  return packageJsonPath
}

async function updateWorkspaceNames(
  rootDir: string,
  workspacePaths: string[],
  projectName: string
) {
  const changedFiles = await Promise.all(
    workspacePaths.map((workspacePath) =>
      updateWorkspacePackageName(rootDir, workspacePath, projectName)
    )
  )

  return changedFiles.filter((path): path is string => path !== null)
}

export async function updatePortlessProjectName(rootDir: string, projectName: string) {
  const workspaces = await Promise.all([
    getWorkspaces(rootDir, "app"),
    getWorkspaces(rootDir, "package"),
  ])
  const workspacePaths = workspaces
    .flat()
    .map((workspace) => relative(rootDir, workspace.directory))

  return updateWorkspaceNames(rootDir, workspacePaths, projectName)
}

export async function restorePortlessWorkspaces(
  rootDir: string,
  workspacePaths: string[],
  projectName: string
) {
  return updateWorkspaceNames(rootDir, workspacePaths, projectName)
}
