import fs from "node:fs"
import path from "node:path"
import { cancel, group, intro, log, multiselect, outro } from "@clack/prompts"
import { runScript } from "../tooling/helpers"

async function main() {
  intro("Select workspaces to keep")

  const allWorkspaces = {
    apps: [] as Array<{ name: string; label: string; value: string }>,
    packages: [] as Array<{ name: string; label: string; value: string }>,
  }
  const workspaceTypes = Object.keys(allWorkspaces)

  // Gather all workspaces
  for (const type of workspaceTypes) {
    const workspaceDir = path.join(__dirname, "..", type)
    const directories = fs
      .readdirSync(workspaceDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        value: dirent.name,
        label: dirent.name,
      }))

    allWorkspaces[type] = directories
  }

  if (Object.values(allWorkspaces).flat().length === 0) {
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

  // Convert selections to workspace objects
  const workspacesToKeep = {
    apps: selections.apps.map(name => ({ name })),
    packages: selections.packages.map(name => ({ name })),
  }

  // Remove unselected workspaces
  for (const type of workspaceTypes) {
    for (const workspace of allWorkspaces[type]) {
      const shouldKeep = workspacesToKeep[type].some(
        keep => keep.name === workspace.name
      )

      if (!shouldKeep) {
        const workspacePath = path.join(__dirname, "..", type, workspace.name)
        fs.rmSync(workspacePath, { recursive: true, force: true })
        log.success(`Removed ${type}/${workspace.name}`)
      }
    }
  }

  outro("Setup complete! Selected workspaces have been kept, others removed.")
}

runScript(main)
