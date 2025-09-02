import Bun from "bun"
import { rm, rmdir } from "node:fs/promises"
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  spinner,
  text,
} from "@clack/prompts"
import {
  executeCommand,
  REMOTE_URL,
  replaceProjectNameInProjectFiles,
  workspaces,
} from "./utils"

const title = `
  ███              ███   █████
 ░░░              ░░░   ░░███
 ████  ████████   ████  ███████
░░███ ░░███░░███ ░░███ ░░░███░
 ░███  ░███ ░███  ░███   ░███
 ░███  ░███ ░███  ░███   ░███ ███
 █████ ████ █████ █████  ░░█████
░░░░░ ░░░░ ░░░░░ ░░░░░    ░░░░░
`

async function removeUnselectedWorkspaces(apps: string[], packages: string[]) {
  const appsToRemove = workspaces.apps
    .filter((app) => !apps.includes(app.name))
    .map((app) => `apps/${app.name}`)
  const packagesToRemove = workspaces.packages
    .filter((pkg) => !packages.includes(pkg.name))
    .map((pkg) => `packages/${pkg.name}`)

  const tasks = [...appsToRemove, ...packagesToRemove].map(async (path) => {
    try {
      await rmdir(path, { recursive: true })
    } catch {
      // Failed to remove directory, continuing...
    }
  })

  await Promise.all(tasks)
}

async function promptForProjectName(): Promise<string> {
  const projectName = await text({
    message:
      "Enter your project name (for @[project-name] monorepo alias). Leave as 'init' or empty to skip renaming.",
    defaultValue: "init",
    placeholder: "init",
  })

  if (isCancel(projectName)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return projectName
}

async function updatePackageJson(projectName: string) {
  const packageJson = await Bun.file("package.json").json()

  packageJson.name = projectName
  packageJson.version = "0.0.1"
  await Bun.write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`)
}

async function setupEnvironmentVariables(paths: string[]) {
  const tasks = paths.map(async (workspacePath) => {
    try {
      const examplePath = `${workspacePath}/.env.example`
      const localPath = `${workspacePath}/.env.local`

      // Check if .env.local already exists
      if (await Bun.file(localPath).exists()) {
        return
      }

      // Try to copy .env.example to .env.local
      await Bun.write(localPath, await Bun.file(examplePath).text())
    } catch {
      // Do nothing for now
    }
  })

  await Promise.all(tasks)
}

async function selectApps(): Promise<string[]> {
  const apps = await multiselect({
    message: "Select apps to keep (all others will be removed)",
    options: workspaces.apps.map((app) => ({
      name: app.description,
      value: app.name,
    })),
  })

  if (isCancel(apps)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return apps
}

async function selectPackages(selectedApps: string[]): Promise<string[]> {
  // Get all package dependencies from selected apps
  const requiredPackages = new Set<string>()
  for (const appName of selectedApps) {
    const app = workspaces.apps.find((a) => a.name === appName)
    if (app?.dependencies) {
      for (const dep of app.dependencies) {
        requiredPackages.add(dep)
      }
    }
  }

  const packages = await multiselect({
    message:
      "Select packages to keep (all others will be removed). We've automatically selected packages that are required by the selected apps.",
    options: workspaces.packages.map((pkg) => ({
      name: pkg.description,
      value: pkg.name,
    })),
    initialValues: Array.from(requiredPackages),
  })

  if (isCancel(packages)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return packages
}

async function confirmSetupRemoteBranch() {
  const confirmed = await confirm({
    message: "Would you like to setup a remote template branch for updates?",
    initialValue: true,
  })

  if (isCancel(confirmed)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return confirmed
}

async function setupGit() {
  const isInitialized = await Bun.file(".git").exists()

  if (isInitialized) {
    return
  }

  try {
    await executeCommand("git init")
  } catch (error) {
    throw new Error(`Failed to initialize Git: ${error}`)
  }
}

async function setupRemoteBranch() {
  try {
    // Check if template remote already exists
    await executeCommand("git remote get-url template")
  } catch {
    // Remote doesn't exist, add it
    await executeCommand(`git remote add template ${REMOTE_URL}`)
  }
}

async function cleanupInternalFiles() {
  const filesToRemove = [
    "release-please-config.json",
    ".github/workflows/release.yml",
    "__tests__",
    "cli",
  ]

  const tasks = filesToRemove.map(async (file) => {
    try {
      await rm(file, { recursive: true, force: true })
    } catch {
      // File doesn't exist or failed to remove, continuing...
    }
  })

  await Promise.all(tasks)
}

async function createNewReadme(projectName: string) {
  await Bun.write(
    "README.md",
    `
<div align="center">
  <h1 align="center"><code>${projectName}</code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `
  )
}

async function init() {
  intro(title)
  log.info("Starting project setup...")

  try {
    const projectName = await promptForProjectName()
    const selectedApps = await selectApps()
    const selectedPackages = await selectPackages(selectedApps)
    const setupRemoteBranchConfirmed = await confirmSetupRemoteBranch()

    await removeUnselectedWorkspaces(selectedApps, selectedPackages)

    if (projectName !== "init") {
      const s1 = spinner()
      s1.start("Updating project name in package.json...")
      await updatePackageJson(projectName)
      s1.stop("Project name updated in package.json.")

      const s2 = spinner()
      s2.start("Replacing @init with project name in project files...")
      await replaceProjectNameInProjectFiles(projectName)
      s2.stop("Project name replaced in project files.")
    }

    const s3 = spinner()
    s3.start("Setting up environment files for workspaces...")
    await setupEnvironmentVariables([
      ...selectedApps.map((app) => `apps/${app}`),
      ...selectedPackages.map((pkg) => `packages/${pkg}`),
    ])
    s3.stop("Environment files setup complete.")

    const s4 = spinner()
    s4.start("Initializing Git repository...")
    await setupGit()
    s4.stop("Git repository initialized.")

    const s5 = spinner()
    s5.start("Setting up remote template branch for updates...")
    if (setupRemoteBranchConfirmed) {
      await setupRemoteBranch()
    }
    s5.stop("Remote template branch setup complete.")

    const s6 = spinner()
    s6.start("Cleaning up internal template files...")
    await cleanupInternalFiles()
    s6.stop("Internal template files removed.")

    const s7 = spinner()
    s7.start("Creating new README...")
    await createNewReadme(projectName)
    s7.stop("README created.")

    const s8 = spinner()
    s8.start("Re-installing dependencies...")
    await executeCommand("bun install")
    s8.stop("Dependencies installed.")

    outro("🎉 All setup steps complete! Your project is ready.")
  } catch (error) {
    cancel(`Operation cancelled: ${error}`)
  }
}

export default init
