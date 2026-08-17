import { join, relative } from "node:path"
import consola from "consola"

import { defineCommand } from "../utils"
import { renameProject } from "./rename"
import {
  getDependencyNames,
  getJsonObject,
  getJsonString,
  getJsonStringArray,
  getProjectScope,
  getWorkspaces,
  readJson,
  removePath,
  runCommand,
  TEMPLATE_SCOPE,
  TemplateFault,
  type Workspace,
  type WorkspaceKind,
  writeJson,
} from "./shared"

type TemplateStamp = {
  commit?: string
  createdAt: string
  template: "metaideas/init"
}

function getSelectedNames(values: string[] | undefined) {
  return values?.flatMap((value) => value.split(",")).filter(Boolean)
}

async function promptForWorkspaceNames(kind: "app" | "package", names: string[]) {
  const selected = await consola.prompt(`Select ${kind}s to keep`, {
    cancel: "reject",
    initial: names,
    options: names,
    type: "multiselect",
  })
  if (!Array.isArray(selected) || !selected.every((value) => value.constructor === String))
    throw new Error(`Expected the ${kind} selection to contain workspace names.`)

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
      throw TemplateFault.create("TemplateFetchError").withDescription(
        "Could not fetch the template commit.",
        `GitHub returned ${response.status}.`
      )
    }

    const body: unknown = await response.json()
    if (body === null || !(body instanceof Object) || !("sha" in body)) {
      throw TemplateFault.create("TemplateFetchError").withDescription(
        "Could not fetch the template commit.",
        "GitHub did not return a commit SHA."
      )
    }
    const sha = body.sha
    if (sha?.constructor !== String) {
      throw TemplateFault.create("TemplateFetchError").withDescription(
        "Could not fetch the template commit.",
        "GitHub did not return a commit SHA."
      )
    }

    return String(sha)
  } catch (error) {
    if (TemplateFault.is(error)) throw error

    throw TemplateFault.wrap(error)
      .as("TemplateFetchError")
      .withDescription("Could not fetch the template commit.", "GitHub request failed.")
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
    const fault = TemplateFault.is(error)
      ? error
      : TemplateFault.wrap(error)
          .as("TemplateFetchError")
          .withDescription("Could not fetch the template commit.", "GitHub request failed.")
    consola.warn(fault.flatten())
  }

  await writeJson(join(rootDir, ".template.json"), stamp)
}

function validateSelection(kind: WorkspaceKind, selected: string[], available: string[]) {
  const unknown = selected.filter((name) => !available.includes(name))
  if (unknown.length > 0) {
    throw TemplateFault.create("UnknownWorkspaceError", {
      kind,
      names: unknown.join(", "),
    }).withDescription(
      `Unknown ${kind} workspace(s): ${unknown.join(", ")}`,
      `Available ${kind} workspaces: ${available.join(", ") || "none"}.`
    )
  }
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
      const packageName = getJsonString(packageJson, "name")

      return {
        dependencies: getDependencyNames(packageJson),
        directory: workspace.directory,
        kind: workspace.kind,
        name: workspace.name,
        packageName: packageName ?? "",
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
  const init = getJsonObject(packageJson, "init")
  const cleanupPaths = init ? (getJsonStringArray(init, "cleanupPaths") ?? []) : []

  await Promise.all(cleanupPaths.map((path) => removePath(rootDir, path)))

  delete packageJson["bun-create"]
  delete packageJson.init
  await writeJson(packageJsonPath, packageJson)
}

export default defineCommand({
  builder: (yargs) =>
    yargs
      .option("name", {
        describe: "Project name for the root package",
        type: "string",
      })
      .option("keep-apps", {
        array: true,
        describe: "Apps to keep (comma-separated or repeated)",
        type: "string",
      })
      .option("keep-packages", {
        array: true,
        describe: "Packages to keep (comma-separated or repeated)",
        type: "string",
      })
      .option("yes", {
        describe: "Accept defaults for any option not provided and skip prompts",
        type: "boolean",
      })
      .option("git", {
        describe: "Initialize a git repository; use --no-git to skip",
        type: "boolean",
      })
      .option("install", {
        describe: "Run bun install; use --no-install to skip",
        type: "boolean",
      }),
  command: "setup",
  describe: "Select workspaces, rename the project, and remove template files",
  handler: async (args) => {
    const rootDir = process.cwd()
    const yes = args.yes ?? false

    const apps = await getWorkspaces(rootDir, "app")
    const packages = await getWorkspaces(rootDir, "package")
    const rootPackage = await readJson(join(rootDir, "package.json"))
    const defaultName = getJsonString(rootPackage, "name") ?? "project"
    const sourceScope = await getProjectScope(rootDir).catch(() => TEMPLATE_SCOPE)

    const keepApps =
      getSelectedNames(args.keepApps) ??
      (yes
        ? apps.map((workspace) => workspace.name)
        : await promptForWorkspaceNames(
            "app",
            apps.map((workspace) => workspace.name)
          ))
    const keepPackages =
      getSelectedNames(args.keepPackages) ??
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

    validateSelection(
      "app",
      keepApps,
      apps.map((workspace) => workspace.name)
    )
    validateSelection(
      "package",
      keepPackages,
      packages.map((workspace) => workspace.name)
    )

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
