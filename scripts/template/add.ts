import Bun from "bun"
import {
  cancel,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts"
import {
  executeCommand,
  replaceProjectNameInProjectFiles,
  type WorkspaceType,
  workspaces,
} from "./utils"

async function selectWorkspaceType(): Promise<WorkspaceType> {
  const workspaceType = await select({
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

  if (isCancel(workspaceType)) {
    throw new Error("Canceled adding workspace")
  }

  return workspaceType
}

async function selectWorkspaces(type: WorkspaceType): Promise<string[]> {
  const options = workspaces[type].map((w) => ({
    value: w.name,
    label: w.description,
  }))

  const selectedWorkspaces = await multiselect({
    message: `Which ${type}(s) would you like to add?`,
    options,
  })

  if (isCancel(selectedWorkspaces)) {
    throw new Error("Canceled adding package")
  }

  return selectedWorkspaces
}

async function getWorkspaceName(workspace: string): Promise<string> {
  const workspaceName = await text({
    message: `What is the name of the ${workspace} app?`,
    defaultValue: workspace,
  })

  if (isCancel(workspaceName)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return workspaceName
}

async function getProjectName(): Promise<string> {
  const packageJson = await Bun.file("package.json").json()
  return packageJson.name
}

async function add() {
  intro("Add workspaces to your monorepo")
  log.info(
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

    const s1 = spinner()
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

    const s2 = spinner()
    s2.start("Replacing project name in added workspaces...")
    await replaceProjectNameInProjectFiles(projectName)
    s2.stop("Project name replaced in workspace files.")

    outro("🎉 All workspaces added successfully! Your project is updated.")
  } catch (error) {
    cancel(`Operation cancelled: ${error}`)
  }
}

export default add
