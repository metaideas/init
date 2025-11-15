import Bun from "bun"
import {
  cancel,
  intro,
  isCancel,
  log,
  outro,
  select,
  text,
} from "@clack/prompts"
import { defineCommand } from "../../tooling/helpers"
import { workspaces } from "./utils"

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

export default defineCommand({
  command: "add",
  describe: "Add workspaces to your monorepo",
  handler: async () => {
    intro("Add workspaces to your monorepo")
    log.info(
      "This script helps you add new apps or packages to your workspace..."
    )

    try {
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

      const selectedWorkspace = await select({
        message: `Which ${workspaceType.slice(0, -1)} would you like to add?`,
        options: workspaces[workspaceType].map((w) => ({
          value: w.name,
          label: w.description,
        })),
      })

      if (isCancel(selectedWorkspace)) {
        throw new Error("Canceled adding workspace")
      }

      const isApp = workspaceType === "apps"
      const projectName: string = await Bun.file("package.json")
        .json()
        .then((data) => data.name)

      const workspaceName = isApp
        ? await getWorkspaceName(selectedWorkspace)
        : selectedWorkspace

      const type = isApp ? "app" : "package"
      const name = (
        isApp ? workspaceName : `@${projectName}/${workspaceName}`
      ).replace(/["\\]/g, "\\$&")

      await Bun.$`turbo gen workspace --copy https://github.com/metaideas/init/tree/main/${workspaceType}/${selectedWorkspace} --type ${type} --name "${name}"`

      outro("🎉 Command generated successfully!")
    } catch (error) {
      cancel(`Operation cancelled: ${error}`)
    }
  },
})
