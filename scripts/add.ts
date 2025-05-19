import fs from "node:fs"
import {
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  select,
  text,
} from "@clack/prompts"

import { runProcess, runScript } from "../tooling/helpers"
import { Workspaces } from "./workspaces"

async function getWorkspaceType(): Promise<keyof typeof Workspaces> {
  const workspaceType = await select({
    message: "Which type of workspace would you like to add?",
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
    outro("Canceled adding workspace")
    process.exit()
  }

  return workspaceType
}

async function chooseWorkspaces(
  type: keyof typeof Workspaces
): Promise<string[]> {
  const options = Workspaces[type].map(w => ({
    value: w.name,
    label: w.description,
  }))

  const workspaces = await multiselect({
    message: `Which ${type === "APPS" ? "app" : "package"}(s) would you like to add?`,
    options,
  })

  if (isCancel(workspaces)) {
    outro("Canceled adding package")
    process.exit()
  }

  return workspaces
}

async function getWorkspaceName(workspace: string): Promise<string> {
  const workspaceName = await text({
    message: `What is the name of the ${workspace} app?`,
    defaultValue: workspace,
  })

  if (isCancel(workspaceName)) {
    outro("Canceled adding app")
    process.exit()
  }

  return workspaceName
}

function getProjectName() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
  return packageJson.name
}

async function main() {
  intro("Add a workspace app or package")

  const workspaceType = await getWorkspaceType()

  const isApp = workspaceType === "APPS"

  const workspaces = await chooseWorkspaces(workspaceType)

  for (const workspace of workspaces) {
    const workspaceName = isApp ? await getWorkspaceName(workspace) : workspace
    const projectName = getProjectName()

    runProcess("turbo", [
      "gen",
      "workspace",
      "--copy",
      `https://github.com/metaideas/init/tree/main/${workspaceType}s/${workspace}`,
      "--type",
      workspaceType,
      "--name",
      isApp ? workspaceName : `@${projectName}/${workspace}`,
    ])

    log.success(`Added "${workspaceName}" ${workspaceType} to the workspace`)
  }

  outro("Done!")
}

runScript(main)
