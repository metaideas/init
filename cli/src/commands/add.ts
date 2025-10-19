import { readFile } from "node:fs/promises"
import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  select,
  text,
} from "@clack/prompts"
import { defineCommand } from "citty"
import { workspaces } from "../utils"

async function selectWorkspaceType() {
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

  return workspaceType as "apps" | "packages"
}

async function selectWorkspace(type: "apps" | "packages"): Promise<string> {
  const options = workspaces[type].map((w) => ({
    value: w.name,
    label: w.description,
  }))

  const selectedWorkspace = await select({
    message: `Which ${type.slice(0, -1)} would you like to add?`,
    options,
  })

  if (isCancel(selectedWorkspace)) {
    throw new Error("Canceled adding workspace")
  }

  return selectedWorkspace as string
}

async function getWorkspaceName(workspace: string): Promise<string> {
  const workspaceName = await text({
    message: `What is the name of the ${workspace} app?`,
    defaultValue: workspace,
  })

  if (isCancel(workspaceName)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return workspaceName as string
}

async function getProjectName(): Promise<string> {
  try {
    const content = await readFile("package.json", "utf-8")
    const packageJson = JSON.parse(content)
    return packageJson.name
  } catch {
    throw new Error("Could not read package.json. Are you in a project root?")
  }
}

export default defineCommand({
  meta: {
    name: "add",
    description: "Add a new workspace",
  },
  run: async () => {
    intro("Add workspaces to your monorepo")
    log.info(
      "This script helps you add new apps or packages to your workspace..."
    )

    try {
      const selectedWorkspaceType = await selectWorkspaceType()
      const selectedWorkspace = await selectWorkspace(selectedWorkspaceType)
      const isApp = selectedWorkspaceType === "apps"
      const projectName = await getProjectName()

      const workspaceName = isApp
        ? await getWorkspaceName(selectedWorkspace)
        : selectedWorkspace

      const type = isApp ? "app" : "package"
      const name = (
        isApp ? workspaceName : `@${projectName}/${workspaceName}`
      ).replace(/["\\]/g, "\\$&")
      const command = `turbo gen workspace --copy https://github.com/metaideas/init/tree/main/${selectedWorkspaceType}/${selectedWorkspace} --type ${type} --name "${name}"`

      log.info("Generated command:")
      log.info(command)
      log.info("")
      log.info("Next steps:")
      log.info("1. Copy the command above")
      log.info("2. Run it in your terminal")
      log.info("3. Run 'bun install' to install dependencies")
      log.info("4. Update any workspace-specific configuration")

      outro("🎉 Command generated successfully!")
    } catch (error) {
      cancel(`Operation cancelled: ${error}`)
      process.exit(1)
    }
  },
})
