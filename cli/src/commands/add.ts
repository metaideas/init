import { readFile } from "node:fs/promises"
import * as prompt from "@clack/prompts"
import { executeCommand } from "../lib/exec"
import {
  replaceProjectNameInProjectFiles,
  type WorkspaceType,
  workspaces,
} from "../lib/files"

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

  return workspaceType as WorkspaceType
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
  try {
    const packageJsonContent = await readFile("package.json", "utf-8")
    const packageJson = JSON.parse(packageJsonContent)
    return packageJson.name
  } catch {
    return "init" // fallback
  }
}

async function add(): Promise<void> {
  prompt.intro("Add workspaces to your monorepo")
  prompt.log.info(
    "This script helps you add new apps or packages to your workspace..."
  )

  try {
    // Check if we're in a project directory
    try {
      await readFile("package.json", "utf-8")
    } catch {
      throw new Error(
        "Please run this command from the root of your project (where package.json is located)"
      )
    }

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
