import fs from "node:fs"
import path from "node:path"
import {
  cancel,
  group,
  intro,
  log,
  multiselect,
  outro,
  text,
  confirm,
} from "@clack/prompts"
import { runScript } from "../tooling/helpers"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vercel",
  ".DS_Store",
  ".cache",
  ".pnpm-store",
  ".yarn",
] as const

type WorkspaceType = "apps" | "packages"
type Workspace = { name: string; label: string; value: string }

function checkShouldExclude(filePath: string): boolean {
  return EXCLUDED_DIRS.some(
    dir => filePath.includes(`${path.sep}${dir}${path.sep}`) || filePath.endsWith(`${path.sep}${dir}`)
  )
}

function getAllFilesRecursively(dir: string, files: string[] = []): string[] {
  if (checkShouldExclude(dir)) return files
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file)
    if (checkShouldExclude(filePath)) continue
    const stat = fs.statSync(filePath)
    stat.isDirectory()
      ? getAllFilesRecursively(filePath, files)
      : files.push(filePath)
  }
  return files
}

function getReplacementCount(content: string, from: string): number {
  return (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length
}

function replaceInFileContent(filePath: string, from: string, to: string): number {
  const content = fs.readFileSync(filePath, "utf8")
  if (!content.includes(from)) return 0
  const replaced = content.split(from).join(to)
  fs.writeFileSync(filePath, replaced, "utf8")
  return getReplacementCount(content, from)
}

async function main() {
  intro("Select workspaces to keep")

  const allWorkspaces: Record<WorkspaceType, Workspace[]> = {
    apps: [],
    packages: [],
  }
  const workspaceTypes: WorkspaceType[] = ["apps", "packages"]

  for (const type of workspaceTypes) {
    const workspaceDir = path.join(__dirname, "..", type)
    allWorkspaces[type] = fs
      .readdirSync(workspaceDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        value: dirent.name,
        label: dirent.name,
      }))
  }

  if (!allWorkspaces.apps.length && !allWorkspaces.packages.length) {
    outro("No workspaces found")
    process.exit()
  }

  const selections = await group(
    {
      apps: () =>
        multiselect({
          message: "Select apps to keep (all others will be removed)",
          options: allWorkspaces.apps,
        }),
      packages: () =>
        multiselect({
          message: "Select packages to keep (all others will be removed)",
          options: allWorkspaces.packages,
        }),
    },
    {
      onCancel: () => {
        cancel("Canceled setup")
        process.exit(0)
      },
    }
  )

  const workspacesToKeep: Record<WorkspaceType, { name: string }[]> = {
    apps: selections.apps.map((name: string) => ({ name })),
    packages: selections.packages.map((name: string) => ({ name })),
  }

  for (const type of workspaceTypes) {
    for (const workspace of allWorkspaces[type]) {
      if (workspacesToKeep[type].some(keep => keep.name === workspace.name)) continue
      const workspacePath = path.join(__dirname, "..", type, workspace.name)
      fs.rmSync(workspacePath, { recursive: true, force: true })
      log.success(`Removed ${type}/${workspace.name}`)
    }
  }

  const projectName = await text({
    message: "Enter your project name (for @[project-name] monorepo alias)",
    defaultValue: "init",
    placeholder: "init",
  })

  if (typeof projectName !== "string" || !projectName.trim() || projectName === "init") {
    outro("Setup complete! Selected workspaces have been kept, others removed.")
    return
  }

  const isDryRun = await confirm({
    message: "Would you like to do a dry run (see what would change, but make no modifications)?",
    initialValue: true,
  })

  const rootDir = path.join(__dirname, "..")
  const allFiles = getAllFilesRecursively(rootDir)
  let totalReplacements = 0
  let filesChanged = 0

  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf8")
    const count = getReplacementCount(content, "@init")
    if (!count) continue
    filesChanged++
    totalReplacements += count
    if (!isDryRun) {
      const replaced = content.split("@init").join(`@${projectName}`)
      fs.writeFileSync(file, replaced, "utf8")
    }
  }

  isDryRun
    ? log.info(`Dry run: Would replace ${totalReplacements} instance(s) of '@init' with '@${projectName}' in ${filesChanged} file(s). No files were modified.`)
    : log.success(`Replaced ${totalReplacements} instance(s) of '@init' with '@${projectName}' in ${filesChanged} file(s).`)

  outro("Setup complete! Selected workspaces have been kept, others removed.")
}

runScript(main)
