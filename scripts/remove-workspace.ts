import fs from "node:fs"
import path from "node:path"
import {
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  select,
} from "@clack/prompts"
import { runScript } from "../tooling/helpers"

async function main() {
  intro("Remove a package from the workspace")

  const workspaceType = await select({
    message: "Which type of workspace would you like to remove?",
    options: [
      {
        value: "apps",
        label: "App",
      },
      {
        value: "packages",
        label: "Package",
      },
    ],
  })

  if (isCancel(workspaceType)) {
    outro("Canceled removing workspace")
    process.exit()
  }

  const workspaceDir = path.join(__dirname, "..", workspaceType)
  const directories = fs
    .readdirSync(workspaceDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({
      value: dirent.name,
      label: dirent.name,
    }))

  if (directories.length === 0) {
    outro("No workspace found to remove")
    process.exit()
  }

  const selectedWorkspaces = await multiselect({
    message: `Which ${workspaceType} would you like to remove?`,
    options: directories,
  })

  if (isCancel(selectedWorkspaces)) {
    outro("Canceled removing workspace")
    process.exit()
  }

  for (const workspace of selectedWorkspaces) {
    fs.rmSync(path.join(workspaceDir, workspace), {
      recursive: true,
      force: true,
    })

    log.success(`Removed ${workspace}`)
  }

  outro("Done!")
}

runScript(main)
