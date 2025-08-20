import { rm, rmdir } from "node:fs/promises"
import { join, resolve } from "node:path"
import * as prompt from "@clack/prompts"
import { REMOTE_HTTPS_URL, TEMPLATE_VERSION } from "../lib/constants"
import { executeCommand } from "../lib/exec"
import { replaceProjectNameInProjectFiles, workspaces } from "../lib/files"
import {
  addRemote,
  cloneRepository,
  initGitRepository,
  isGitRepository,
} from "../lib/git"

const title = `
██╗███╗   ██╗██╗████████╗
██║████╗  ██║██║╚══██╔══╝
██║██╔██╗ ██║██║   ██║   
██║██║╚██╗██║██║   ██║   
██║██║ ╚████║██║   ██║   
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   
`

async function cloneTemplate(targetDir: string): Promise<void> {
  // Use HTTPS by default to avoid SSH host key issues
  await cloneRepository(REMOTE_HTTPS_URL, targetDir, [
    "--depth",
    "1",
    "--quiet",
  ])
}

async function removeUnselectedWorkspaces(
  apps: string[],
  packages: string[],
  targetDir: string
): Promise<void> {
  const appsToRemove = workspaces.apps
    .filter((app) => !apps.includes(app.name))
    .map((app) => join(targetDir, `apps/${app.name}`))
  const packagesToRemove = workspaces.packages
    .filter((pkg) => !packages.includes(pkg.name))
    .map((pkg) => join(targetDir, `packages/${pkg.name}`))

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
  const projectName = await prompt.text({
    message: "Enter your project name (will be used as both project name and directory name)",
    placeholder: "my-project",
  })

  if (prompt.isCancel(projectName)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return projectName
}


async function updatePackageJson(
  projectName: string,
  targetDir: string
): Promise<void> {
  const { readFile, writeFile } = await import("node:fs/promises")
  const packageJsonPath = join(targetDir, "package.json")
  const packageJsonContent = await readFile(packageJsonPath, "utf-8")
  const packageJson = JSON.parse(packageJsonContent)

  packageJson.name = projectName
  packageJson.version = "0.0.1"
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
}

async function setupEnvironmentVariables(paths: string[]): Promise<void> {
  const tasks = paths.map(async (workspacePath) => {
    try {
      const { readFile, writeFile, access } = await import("node:fs/promises")
      const examplePath = `${workspacePath}/.env.example`
      const localPath = `${workspacePath}/.env.local`

      // Check if .env.local already exists
      try {
        await access(localPath)
        return
      } catch {
        // File doesn't exist, continue
      }

      // Try to copy .env.example to .env.local
      const exampleContent = await readFile(examplePath, "utf-8")
      await writeFile(localPath, exampleContent)
    } catch {
      // Do nothing for now
    }
  })

  await Promise.all(tasks)
}

async function selectApps(): Promise<string[]> {
  const apps = await prompt.multiselect({
    message: "Select apps to keep (all others will be removed)",
    options: workspaces.apps.map((app) => ({
      name: app.description,
      value: app.name,
    })),
  })

  if (prompt.isCancel(apps)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return apps
}

async function selectPackages(): Promise<string[]> {
  const packages = await prompt.multiselect({
    message: "Select packages to keep (all others will be removed)",
    options: workspaces.packages.map((pkg) => ({
      name: pkg.description,
      value: pkg.name,
    })),
  })

  if (prompt.isCancel(packages)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return packages
}

async function confirmSetupRemoteBranch(): Promise<boolean> {
  const confirmed = await prompt.confirm({
    message: "Would you like to setup a remote template branch for updates?",
    initialValue: true,
  })

  if (prompt.isCancel(confirmed)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return confirmed
}

async function setupGit(targetDir: string): Promise<void> {
  const isInitialized = await isGitRepository()

  if (isInitialized) {
    return
  }

  try {
    process.chdir(targetDir)
    await initGitRepository()
  } catch (error) {
    throw new Error(`Failed to initialize Git: ${error}`)
  }
}

async function setupRemoteBranch(targetDir: string): Promise<void> {
  process.chdir(targetDir)
  // Use HTTPS by default to avoid SSH host key issues
  await addRemote("template", REMOTE_HTTPS_URL)
}

async function cleanupInternalFiles(targetDir: string): Promise<void> {
  const filesToRemove = [
    ".release-please-manifest.json",
    "release-please-config.json",
    ".github/workflows/release.yml",
    "docs",
    "__tests__",
    "scripts",
    "cli",
    ".git",
  ]

  const tasks = filesToRemove.map(async (file) => {
    try {
      await rm(join(targetDir, file), { recursive: true, force: true })
    } catch {
      // File doesn't exist or failed to remove, continuing...
    }
  })

  await Promise.all(tasks)
}

async function createNewReadme(
  projectName: string,
  targetDir: string
): Promise<void> {
  const { writeFile } = await import("node:fs/promises")
  await writeFile(
    join(targetDir, "README.md"),
    `
<div align="center">
  <h1 align="center"><code>${projectName}</code></h1>
</div>

Made with [init](https://github.com/metaideas/init)
    `
  )
}

async function createTemplateVersionFile(targetDir: string): Promise<void> {
  const { writeFile } = await import("node:fs/promises")
  await writeFile(join(targetDir, ".template-version"), TEMPLATE_VERSION)
}

async function init(): Promise<void> {
  prompt.intro(title)
  prompt.log.info("Starting project setup...")

  try {
    const projectName = await promptForProjectName()
    const targetDir = resolve(projectName)

    const s1 = prompt.spinner()
    s1.start("Cloning template repository...")
    await cloneTemplate(targetDir)
    s1.stop("Template repository cloned.")

    const selectedApps = await selectApps()
    const selectedPackages = await selectPackages()
    const setupRemoteBranchConfirmed = await confirmSetupRemoteBranch()

    const s2 = prompt.spinner()
    s2.start("Removing unselected workspaces...")
    await removeUnselectedWorkspaces(selectedApps, selectedPackages, targetDir)
    s2.stop("Unselected workspaces removed.")

    const s3 = prompt.spinner()
    s3.start("Updating project name in package.json...")
    await updatePackageJson(projectName, targetDir)
    s3.stop("Project name updated in package.json.")

    const s4 = prompt.spinner()
    s4.start("Replacing @init with project name in project files...")
    await replaceProjectNameInProjectFiles(projectName, targetDir)
    s4.stop("Project name replaced in project files.")

    const s5 = prompt.spinner()
    s5.start("Setting up environment files for workspaces...")
    await setupEnvironmentVariables([
      ...selectedApps.map((app) => join(targetDir, `apps/${app}`)),
      ...selectedPackages.map((pkg) => join(targetDir, `packages/${pkg}`)),
    ])
    s5.stop("Environment files setup complete.")

    const s6 = prompt.spinner()
    s6.start("Cleaning up internal template files...")
    await cleanupInternalFiles(targetDir)
    s6.stop("Internal template files removed.")

    const s7 = prompt.spinner()
    s7.start("Initializing Git repository...")
    await setupGit(targetDir)
    s7.stop("Git repository initialized.")

    const s8 = prompt.spinner()
    s8.start("Setting up remote template branch...")
    if (setupRemoteBranchConfirmed) {
      await setupRemoteBranch(targetDir)
    }
    s8.stop("Remote template branch setup complete.")

    const s9 = prompt.spinner()
    s9.start("Creating new README...")
    await createNewReadme(projectName, targetDir)
    s9.stop("README created.")

    const s10 = prompt.spinner()
    s10.start("Creating template version file...")
    await createTemplateVersionFile(targetDir)
    s10.stop("Template version file created.")

    const s11 = prompt.spinner()
    s11.start("Installing dependencies...")
    process.chdir(targetDir)
    await executeCommand("bun install")
    s11.stop("Dependencies installed.")

    prompt.outro(
      `🎉 All setup steps complete! Your project is ready at ${targetDir}`
    )
  } catch (error) {
    prompt.cancel(`Operation cancelled: ${error}`)
  }
}

export default init
