import Bun from "bun"
import { rmdir } from "node:fs/promises"
import { executeCommand, prompt, runScript } from "@tooling/helpers"
import {
  REMOTE_URL,
  replaceProjectNameInProjectFiles,
  workspaces,
} from "./utils"

const title = `
    ██╗███╗   ██╗██╗████████╗
    ██║████╗  ██║██║╚══██╔══╝
    ██║██╔██╗ ██║██║   ██║   
    ██║██║╚██╗██║██║   ██║   
    ██║██║ ╚████║██║   ██║   
    ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   
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
  const projectName = await prompt.text({
    message:
      "Enter your project name (for @[project-name] monorepo alias). Leave as 'init' or empty to skip renaming.",
    defaultValue: "init",
    placeholder: "init",
  })

  if (prompt.isCancel(projectName)) {
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

async function confirmSetupRemoteBranch() {
  const confirmed = await prompt.confirm({
    message: "Would you like to setup a remote template branch for updates?",
    initialValue: true,
  })

  if (prompt.isCancel(confirmed)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return confirmed
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
    ".release-please-manifest.json",
    "release-please-config.json", 
    ".github/workflows/release.yml",
    ".template-version",
    "docs"
  ]

  const tasks = filesToRemove.map(async (file) => {
    try {
      if (await Bun.file(file).exists()) {
        await executeCommand(`rm -rf ${file}`)
      }
    } catch {
      // File doesn't exist or failed to remove, continuing...
    }
  })

  await Promise.all(tasks)
}

async function createNewReadme(projectName: string) {
  await Bun.write("README.md", `# ${projectName}\n`)
}

async function main() {
  prompt.intro(title)
  prompt.log.info("Starting project setup...")

  try {
    const projectName = await promptForProjectName()
    const selectedApps = await selectApps()
    const selectedPackages = await selectPackages()
    const setupRemoteBranchConfirmed = await confirmSetupRemoteBranch()

    await removeUnselectedWorkspaces(selectedApps, selectedPackages)

    if (projectName !== "init") {
      const s1 = prompt.spinner()
      s1.start("Updating project name in package.json...")
      await updatePackageJson(projectName)
      s1.stop("Project name updated in package.json.")

      const s2 = prompt.spinner()
      s2.start("Replacing @init with project name in project files...")
      await replaceProjectNameInProjectFiles(projectName)
      s2.stop("Project name replaced in project files.")

      prompt.log.success("✅ Project renaming steps complete!")
    }

    const s3 = prompt.spinner()
    s3.start("Setting up environment files for workspaces...")
    await setupEnvironmentVariables([
      ...selectedApps.map((app) => `apps/${app}`),
      ...selectedPackages.map((pkg) => `packages/${pkg}`),
    ])
    s3.stop("Environment files setup complete.")

    const s4 = prompt.spinner()
    s4.start("Setting up remote template branch for updates...")
    if (setupRemoteBranchConfirmed) {
      await setupRemoteBranch()
    }
    s4.stop("Remote template branch setup complete.")

    const s5 = prompt.spinner()
    s5.start("Cleaning up internal template files...")
    await cleanupInternalFiles()
    s5.stop("Internal template files removed.")

    const s6 = prompt.spinner()
    s6.start("Creating new README...")
    await createNewReadme(projectName)
    s6.stop("README created.")

    prompt.outro("🎉 All setup steps complete! Your project is ready.")
  } catch (error) {
    prompt.cancel(`Operation cancelled: ${error}`)
  }
}

runScript(main)
