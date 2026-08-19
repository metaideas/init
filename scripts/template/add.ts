import { join } from "node:path"
import consola from "consola"

import { defineCommand } from "citty"
import { restorePortlessWorkspaces } from "./portless"
import { renameProject } from "./rename"
import {
  getDependencyNames,
  getProjectScope,
  getScopePrefix,
  readJson,
  runCommand,
  TEMPLATE_SCOPE,
  type WorkspaceKind,
} from "./shared"

const TEMPLATE_REPO = "metaideas/init"
const TEMPLATE_BRANCH = "main"

type TemplateWorkspace = {
  kind: WorkspaceKind
  name: string
}

function getWorkspacePath(workspace: TemplateWorkspace) {
  return `${workspace.kind}s/${workspace.name}`
}

function getWorkspacePackageName(workspace: TemplateWorkspace) {
  return workspace.kind === "package"
    ? `${getScopePrefix(TEMPLATE_SCOPE)}${workspace.name}`
    : workspace.name
}

async function copyTemplateWorkspace(rootDir: string, workspace: TemplateWorkspace) {
  const workspacePath = getWorkspacePath(workspace)
  const source = `https://github.com/${TEMPLATE_REPO}/tree/${TEMPLATE_BRANCH}/${workspacePath}`
  const command = [
    "bunx",
    "turbo",
    "gen",
    "workspace",
    "--copy",
    source,
    "--name",
    getWorkspacePackageName(workspace),
    "--type",
    workspace.kind,
    "--destination",
    workspacePath,
  ]

  await runCommand(command, rootDir)

  const packageJsonPath = join(rootDir, workspacePath, "package.json")
  if (!(await Bun.file(packageJsonPath).exists())) {
    throw new Error(
      `Command failed: ${command.join(" ")}. The generator did not create the ${workspacePath} workspace.`
    )
  }

  return readJson(packageJsonPath)
}

async function getMissingTemplateDependencies(
  rootDir: string,
  packageJson: Record<string, unknown>,
  visited: Set<string>
) {
  const prefix = getScopePrefix(TEMPLATE_SCOPE)
  const candidates = getDependencyNames(packageJson)
    .filter((dependencyName) => dependencyName.startsWith(prefix))
    .map((dependencyName): TemplateWorkspace => ({
      kind: "package",
      name: dependencyName.slice(prefix.length),
    }))
    .filter((workspace) => {
      const workspacePath = getWorkspacePath(workspace)
      if (visited.has(workspacePath)) return false

      visited.add(workspacePath)
      return true
    })
  const existence = await Promise.all(
    candidates.map((workspace) =>
      Bun.file(join(rootDir, getWorkspacePath(workspace), "package.json")).exists()
    )
  )

  return candidates.filter((_, index) => !existence[index])
}

async function addWorkspaces(
  rootDir: string,
  scope: string,
  queue: TemplateWorkspace[],
  visited: Set<string>
): Promise<string[]> {
  const [workspace, ...remaining] = queue
  if (!workspace) return []

  const workspacePath = getWorkspacePath(workspace)
  const packageJson = await copyTemplateWorkspace(rootDir, workspace)
  const missing = await getMissingTemplateDependencies(rootDir, packageJson, visited)

  await renameProject({
    rootDir: join(rootDir, workspacePath),
    scope,
    sourceScope: TEMPLATE_SCOPE,
  })

  if (missing.length > 0) {
    consola.info(
      `Copying missing workspace dependencies of ${workspacePath}: ${missing
        .map((dependency) => getWorkspacePath(dependency))
        .join(", ")}.`
    )
  }

  return [
    workspacePath,
    ...(await addWorkspaces(rootDir, scope, [...remaining, ...missing], visited)),
  ]
}

export default defineCommand({
  args: {
    kind: {
      description: "Workspace type to add: app or package",
      required: true,
      type: "positional",
    },
    name: {
      description: "Name of the template workspace to copy",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description: "Copy an app or package from the init template",
    name: "add",
  },
  run: async ({ args }) => {
    if (args.kind !== "app" && args.kind !== "package") {
      throw new Error(`Unknown workspace type: ${args.kind}. Use app or package.`)
    }

    const rootDir = process.cwd()
    const scope = await getProjectScope(rootDir)
    const target: TemplateWorkspace = { kind: args.kind, name: args.name }
    const targetPath = getWorkspacePath(target)

    if (await Bun.file(join(rootDir, targetPath, "package.json")).exists()) {
      throw new Error(`The ${targetPath} workspace already exists in this project.`)
    }

    const copiedPaths = await addWorkspaces(rootDir, scope, [target], new Set([targetPath]))
    await restorePortlessWorkspaces(rootDir, copiedPaths, scope)
    consola.success(`Added ${copiedPaths.join(", ")}. Run bun install to link the new workspaces.`)
  },
})
