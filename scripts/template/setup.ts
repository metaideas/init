import { join, relative } from "node:path"
import { defineCommand } from "citty"
import consola from "consola"

import { renameProject } from "./rename"
import {
  getDependencyNames,
  getProjectScope,
  getWorkspaces,
  normalizeScope,
  readJson,
  removePath,
  runCommand,
  TEMPLATE_SCOPE,
  type Workspace,
  type WorkspaceKind,
  writeJson,
} from "./shared"

type TemplateStamp = {
  commit?: string
  createdAt: string
  template: "metaideas/init"
}

async function promptForWorkspaceNames(kind: "app" | "package", names: string[]) {
  const selected = (await consola.prompt(`Select ${kind}s to keep`, {
    cancel: "reject",
    initial: names,
    options: names.map((name) => ({ label: name, value: name })),
    type: "multiselect",
  })) as unknown as string[]

  return selected
}

async function promptForText(message: string, initial: string) {
  return await consola.prompt(message, {
    cancel: "reject",
    default: initial,
    type: "text",
  })
}

async function promptForConfirmation(message: string) {
  return await consola.prompt(message, {
    cancel: "reject",
    initial: true,
    type: "confirm",
  })
}

async function getCommit() {
  try {
    const response = await fetch("https://api.github.com/repos/metaideas/init/commits/main")
    if (!response.ok) {
      throw new Error(`Could not fetch the template commit. GitHub returned ${response.status}.`)
    }

    const body = (await response.json()) as { sha?: unknown }
    if (typeof body.sha !== "string") {
      throw new Error("Could not fetch the template commit. GitHub did not return a commit SHA.")
    }

    return body.sha
  } catch (error) {
    throw new Error("Could not fetch the template commit.", { cause: error })
  }
}

async function writeTemplateStamp(rootDir: string) {
  const stamp: TemplateStamp = {
    createdAt: new Date().toISOString(),
    template: "metaideas/init",
  }

  try {
    stamp.commit = await getCommit()
  } catch (error) {
    consola.warn(error)
  }

  await writeJson(join(rootDir, ".template.json"), stamp)
}

function getSelectionError(
  kind: WorkspaceKind,
  selected: string[],
  available: string[]
): string | null {
  const unknown = selected.filter((name) => !available.includes(name))
  if (unknown.length > 0) {
    return `Unknown ${kind} workspace(s): ${unknown.join(", ")}. Available: ${available.join(", ") || "none"}.`
  }

  return null
}

type WorkspaceWithDependencies = Workspace & {
  dependencies: string[]
  kind: WorkspaceKind
  packageName: string
}

function getWorkspaceKey(workspace: Pick<WorkspaceWithDependencies, "kind" | "name">) {
  return `${workspace.kind}/${workspace.name}`
}

async function expandWorkspaceSelection(
  apps: Workspace[],
  packages: Workspace[],
  selectedApps: string[],
  selectedPackages: string[]
) {
  const workspaceEntries: Array<Workspace & { kind: WorkspaceKind }> = [
    ...apps.map(({ directory, name }) => ({ directory, kind: "app" as const, name })),
    ...packages.map(({ directory, name }) => ({ directory, kind: "package" as const, name })),
  ]
  const workspaces: WorkspaceWithDependencies[] = await Promise.all(
    workspaceEntries.map(async (workspace) => {
      const packageJson = await readJson(join(workspace.directory, "package.json"))
      const packageName = packageJson.name

      return {
        dependencies: getDependencyNames(packageJson),
        directory: workspace.directory,
        kind: workspace.kind,
        name: workspace.name,
        packageName: typeof packageName === "string" ? packageName : "",
      }
    })
  )
  const workspacesByPackageName = new Map(
    workspaces.map((workspace) => [workspace.packageName, workspace])
  )
  const selectedWorkspaceKeys = new Set([
    ...selectedApps.map((name) => `app/${name}`),
    ...selectedPackages.map((name) => `package/${name}`),
  ])
  const queue = workspaces.filter((workspace) =>
    selectedWorkspaceKeys.has(getWorkspaceKey(workspace))
  )
  const autoKept: WorkspaceWithDependencies[] = []

  for (const workspace of queue) {
    for (const dependencyName of workspace.dependencies) {
      const dependency = workspacesByPackageName.get(dependencyName)
      if (!dependency || selectedWorkspaceKeys.has(getWorkspaceKey(dependency))) continue

      selectedWorkspaceKeys.add(getWorkspaceKey(dependency))
      queue.push(dependency)
      autoKept.push(dependency)
    }
  }

  return {
    autoKept,
    keepApps: apps
      .filter((workspace) => selectedWorkspaceKeys.has(`app/${workspace.name}`))
      .map((workspace) => workspace.name),
    keepPackages: packages
      .filter((workspace) => selectedWorkspaceKeys.has(`package/${workspace.name}`))
      .map((workspace) => workspace.name),
  }
}

async function pruneWorkspaces(rootDir: string, workspaces: Workspace[], selectedNames: string[]) {
  await Promise.all(
    workspaces
      .filter((workspace) => !selectedNames.includes(workspace.name))
      .map((workspace) => removePath(rootDir, relative(rootDir, workspace.directory)))
  )
}

async function cleanupTemplateFiles(rootDir: string) {
  const packageJsonPath = join(rootDir, "package.json")
  const packageJson = await readJson(packageJsonPath)
  const init = packageJson.init as { cleanupPaths?: unknown } | undefined
  const cleanupPaths = Array.isArray(init?.cleanupPaths) ? init.cleanupPaths : []

  await Promise.all(
    cleanupPaths
      .filter((path): path is string => typeof path === "string")
      .map((path) => removePath(rootDir, path))
  )

  delete packageJson["bun-create"]
  delete packageJson.init
  await writeJson(packageJsonPath, packageJson)
}

export default defineCommand({
  args: {
    git: {
      description: "Initialize a git repository",
      negativeDescription: "Skip git repository initialization",
      type: "boolean",
    },
    install: {
      description: "Run bun install",
      negativeDescription: "Skip bun install",
      type: "boolean",
    },
    "keep-apps": {
      description: "Apps to keep (comma-separated)",
      type: "string",
    },
    "keep-packages": {
      description: "Packages to keep (comma-separated)",
      type: "string",
    },
    name: {
      description: "Project name for the root package",
      type: "string",
    },
    yes: {
      description: "Accept defaults for any option not provided and skip prompts",
      type: "boolean",
    },
  },
  meta: {
    description: "Select workspaces, rename the project, and remove template files",
    name: "setup",
  },
  run: async ({ args, rawArgs }) => {
    const rootDir = process.cwd()
    const yes = args.yes ?? false
    const hasEmptyKeepAppsOption = rawArgs.some(
      (argument, index) =>
        (argument === "--keep-apps" || argument === "--keepApps") &&
        rawArgs[index + 1]?.startsWith("-") !== false
    )
    const hasEmptyKeepPackagesOption = rawArgs.some(
      (argument, index) =>
        (argument === "--keep-packages" || argument === "--keepPackages") &&
        rawArgs[index + 1]?.startsWith("-") !== false
    )

    if (hasEmptyKeepAppsOption) {
      consola.error("Provide at least one workspace name with --keep-apps.")
      process.exitCode = 1
      return
    }
    if (hasEmptyKeepPackagesOption) {
      consola.error("Provide at least one workspace name with --keep-packages.")
      process.exitCode = 1
      return
    }

    const apps = await getWorkspaces(rootDir, "app")
    const packages = await getWorkspaces(rootDir, "package")
    const rootPackage = await readJson(join(rootDir, "package.json"))
    const defaultName = typeof rootPackage.name === "string" ? rootPackage.name : "project"
    const sourceScope = await getProjectScope(rootDir).catch(() => TEMPLATE_SCOPE)
    const selectedApps = args["keep-apps"]?.split(",").filter(Boolean)
    const selectedPackages = args["keep-packages"]?.split(",").filter(Boolean)

    if (args["keep-apps"] !== undefined && selectedApps?.length === 0) {
      consola.error("Provide at least one workspace name with --keep-apps.")
      process.exitCode = 1
      return
    }
    if (args["keep-packages"] !== undefined && selectedPackages?.length === 0) {
      consola.error("Provide at least one workspace name with --keep-packages.")
      process.exitCode = 1
      return
    }

    const keepApps =
      selectedApps ??
      (yes
        ? apps.map((workspace) => workspace.name)
        : await promptForWorkspaceNames(
            "app",
            apps.map((workspace) => workspace.name)
          ))
    const keepPackages =
      selectedPackages ??
      (yes
        ? packages.map((workspace) => workspace.name)
        : await promptForWorkspaceNames(
            "package",
            packages.map((workspace) => workspace.name)
          ))
    const projectName =
      args.name ?? (yes ? defaultName : await promptForText("Project name", defaultName))
    const shouldInitializeGit =
      args.git ?? (yes ? true : await promptForConfirmation("Initialize a git repository?"))
    const shouldInstall =
      args.install ?? (yes ? true : await promptForConfirmation("Run bun install?"))

    const selectionError =
      getSelectionError(
        "app",
        keepApps,
        apps.map((workspace) => workspace.name)
      ) ??
      getSelectionError(
        "package",
        keepPackages,
        packages.map((workspace) => workspace.name)
      )
    if (selectionError) {
      consola.error(selectionError)
      process.exitCode = 1
      return
    }
    try {
      normalizeScope(projectName)
    } catch (error) {
      consola.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
      return
    }

    const selection = await expandWorkspaceSelection(apps, packages, keepApps, keepPackages)
    if (selection.autoKept.length > 0) {
      consola.info(
        `Keeping workspace dependencies: ${selection.autoKept
          .map((workspace) => `${workspace.kind}s/${workspace.name}`)
          .join(", ")}.`
      )
    }

    await pruneWorkspaces(rootDir, apps, selection.keepApps)
    await pruneWorkspaces(rootDir, packages, selection.keepPackages)
    await renameProject({ projectName, rootDir, scope: projectName, sourceScope })
    await writeTemplateStamp(rootDir)

    if (shouldInitializeGit && !(await Bun.file(join(rootDir, ".git")).exists()))
      await runCommand(["git", "init"], rootDir)
    if (shouldInstall) await runCommand(["bun", "install"], rootDir)

    await cleanupTemplateFiles(rootDir)
    consola.success("Template setup complete.")
  },
})
