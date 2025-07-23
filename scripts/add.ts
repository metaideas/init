import Bun from "bun"
import { executeCommand, prompt } from "@tooling/helpers"
import {
  replaceProjectNameInProjectFiles,
  type WorkspaceType,
  workspaces,
} from "./utils"

async function selectWorkspaceType(): Promise<WorkspaceType> {
  const workspaceType = await prompt.select({
    message: "Which type of workspace would you like to add?",
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

  if (prompt.isCancel(workspaceType)) {
    throw new Error("Canceled adding workspace")
  }

  return workspaceType
}

async function selectWorkspaces(type: WorkspaceType): Promise<string[]> {
  const options = workspaces[type].map((w) => ({
    value: w.name,
    label: w.description,
  }))

  const selectedWorkspaces = await prompt.multiselect({
    message: `Which ${type}(s) would you like to add?`,
    options,
  })

  if (prompt.isCancel(selectedWorkspaces)) {
    throw new Error("Canceled adding package")
  }

  return selectedWorkspaces
}

async function getWorkspaceName(workspace: string): Promise<string> {
  const workspaceName = await prompt.text({
    message: `What is the name of the ${workspace} app?`,
    defaultValue: workspace,
  })

  if (prompt.isCancel(workspaceName)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return workspaceName
}

async function getProjectName(): Promise<string> {
  const packageJson = await Bun.file("package.json").json()
  return packageJson.name
}

async function add() {
  prompt.intro("Add workspaces to your monorepo")
  prompt.log.info(
    "This script helps you add new apps or packages to your workspace..."
  )

  try {
    const selectedWorkspaceType = await selectWorkspaceType()
    const selectedWorkspaces = await selectWorkspaces(selectedWorkspaceType)
    const isApp = selectedWorkspaceType === "apps"
    const projectName = await getProjectName()

    const workspaceNames = await Promise.all(
      selectedWorkspaces.map((workspace) =>
        isApp ? getWorkspaceName(workspace) : Promise.resolve(workspace)
      )
    )

    const s1 = prompt.spinner()
    s1.start("Adding selected workspaces...")

    const tasks = workspaceNames.map(async (workspaceName) => {
      try {
        await executeCommand(
          `turbo gen workspace --copy https://github.com/metaideas/init/tree/main/${selectedWorkspaceType}/${workspaceName} --type ${selectedWorkspaceType} --name ${isApp ? workspaceName : `@${projectName}/${workspaceName}`}`
        )
      } catch {
        // Failed to add workspace, continuing...
      }
    })

    await Promise.all(tasks)
    s1.stop("Workspaces added successfully.")

    const s2 = prompt.spinner()
    s2.start("Replacing project name in added workspaces...")
    await replaceProjectNameInProjectFiles(projectName)
    s2.stop("Project name replaced in workspace files.")

    prompt.outro(
      "🎉 All workspaces added successfully! Your project is updated."
    )
  } catch (error) {
    prompt.cancel(`Operation cancelled: ${error}`)
  }
}

export default add
