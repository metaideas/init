import { readdir, rm } from "node:fs/promises"
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
} from "@clack/prompts"
import { defineCommand } from "citty"

async function getWorkspaces(): Promise<{
  apps: string[]
  packages: string[]
}> {
  const apps: string[] = []
  const packages: string[] = []

  try {
    const appsEntries = await readdir("apps", { withFileTypes: true })
    apps.push(
      ...appsEntries.filter((e) => e.isDirectory()).map((e) => e.name)
    )
  } catch {
    // apps directory might not exist
  }

  try {
    const packagesEntries = await readdir("packages", { withFileTypes: true })
    packages.push(
      ...packagesEntries.filter((e) => e.isDirectory()).map((e) => e.name)
    )
  } catch {
    // packages directory might not exist
  }

  return { apps, packages }
}

async function selectWorkspaceType() {
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
    throw new Error("Canceled removing workspace")
  }

  return workspaceType as "apps" | "packages"
}

async function selectWorkspaceToRemove(
  type: "apps" | "packages",
  availableWorkspaces: string[]
): Promise<string> {
  if (availableWorkspaces.length === 0) {
    throw new Error(`No ${type} found in your project`)
  }

  const workspace = await select({
    message: `Which ${type.slice(0, -1)} would you like to remove?`,
    options: availableWorkspaces.map((w) => ({
      value: w,
      label: w,
    })),
  })

  if (isCancel(workspace)) {
    throw new Error("Canceled removing workspace")
  }

  return workspace as string
}

async function confirmRemoval(
  workspaceName: string,
  workspaceType: string
): Promise<boolean> {
  const confirmed = await confirm({
    message: `Are you sure you want to remove ${workspaceType.slice(0, -1)} "${workspaceName}"? This action cannot be undone.`,
  })

  if (isCancel(confirmed)) {
    throw new Error("Canceled removing workspace")
  }

  return confirmed as boolean
}

async function removeWorkspace(
  workspaceType: "apps" | "packages",
  workspaceName: string
) {
  const path = `${workspaceType}/${workspaceName}`

  try {
    await rm(path, { recursive: true, force: true })
  } catch (error) {
    throw new Error(`Failed to remove workspace: ${error}`)
  }
}

export default defineCommand({
  meta: {
    name: "remove",
    description: "Remove a workspace from your monorepo",
  },
  run: async () => {
    intro("Remove workspace from your monorepo")

    try {
      const { apps, packages } = await getWorkspaces()
      const workspaceType = await selectWorkspaceType()
      const availableWorkspaces = workspaceType === "apps" ? apps : packages

      const workspaceToRemove = await selectWorkspaceToRemove(
        workspaceType,
        availableWorkspaces
      )

      const confirmed = await confirmRemoval(workspaceToRemove, workspaceType)

      if (!confirmed) {
        cancel("Workspace removal cancelled")
        return
      }

      const s = spinner()
      s.start(`Removing ${workspaceType.slice(0, -1)} "${workspaceToRemove}"...`)

      await removeWorkspace(workspaceType, workspaceToRemove)

      s.stop(`Workspace "${workspaceToRemove}" removed.`)

      log.success(`Successfully removed ${workspaceType.slice(0, -1)} "${workspaceToRemove}"`)
      log.info("Next steps:")
      log.info("1. Run 'bun install' to update dependencies")
      log.info("2. Update any workspace references in your codebase")

      outro("🎉 Workspace removed successfully!")
    } catch (error) {
      cancel(`Operation cancelled: ${error}`)
      process.exit(1)
    }
  },
})
