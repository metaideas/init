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

type WorkspaceType = "app" | "package"

async function getWorkspaceType(): Promise<WorkspaceType> {
  const workspaceType = await select({
    message: "Which type of workspace would you like to remove?",
    options: [
      {
        value: "APPS",
        label: "App",
      },
      {
        value: "PACKAGES",
        label: "Package",
      },
    ],
  })

  if (isCancel(workspaceType)) {
    outro("Canceled removing workspace")
    process.exit()
  }

  return workspaceType === "APPS" ? "app" : "package"
}

async function chooseWorkspaces(
  directories: {
    value: string
    label: string
  }[]
) {
  const selected = await multiselect({
    message: "Which workspace(s) would you like to remove?",
    options: directories,
  })

  if (isCancel(selected)) {
    outro("Canceled removing workspace")
    process.exit()
  }

  return selected
}

async function main() {
  intro("Remove a workspace app or package")

  const workspaceType = await getWorkspaceType()

  const workspaceDir = path.join(__dirname, "..", `${workspaceType}s`)
  const directories = fs
    .readdirSync(workspaceDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
      value: dirent.name,
      label: dirent.name,
    }))

  if (directories.length === 0) {
    outro("No workspace(s) found to remove")
    process.exit()
  }

  const selected = await chooseWorkspaces(directories)

  for (const workspace of selected) {
    fs.rmSync(path.join(workspaceDir, workspace), {
      recursive: true,
      force: true,
    })

    log.success(`Removed ${workspace}`)
  }

  log.success("Done!")
}

runScript(main)
