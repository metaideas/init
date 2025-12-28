import Bun from "bun"
import consola from "consola"
import { defineCommand } from "../helpers"
import { replaceProjectNameInProjectFiles, workspaces } from "./utils"

async function removeUnselectedWorkspaces(apps: string[], packages: string[]) {
  const appsToRemove = workspaces.apps
    .filter((app) => !apps.includes(app.name))
    .map((app) => `apps/${app.name}`)
  const packagesToRemove = workspaces.packages
    .filter((pkg) => !packages.includes(pkg.name))
    .map((pkg) => `packages/${pkg.name}`)

  const tasks = [...appsToRemove, ...packagesToRemove].map(async (path) => {
    try {
      await Bun.$`rm -rf ${path}`.quiet()
    } catch {
      // Failed to remove directory, continuing...
    }
  })

  await Promise.all(tasks)
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
      const templatePath = `${workspacePath}/.env.template`
      const localPath = `${workspacePath}/.env.local`

      // Check if .env.local already exists
      if (await Bun.file(localPath).exists()) {
        return
      }

      // Try to copy .env.template to .env.local
      await Bun.write(localPath, await Bun.file(templatePath).text())
    } catch {
      // Do nothing for now
    }
  })

  await Promise.all(tasks)
}

async function setupGit() {
  // Check if git repo exists by checking if .git directory exists
  if (await Bun.file(".git").exists()) {
    return
  }

  try {
    await Bun.$`git init`
  } catch (error) {
    throw new Error(
      `Failed to initialize Git: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
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
      await Bun.$`rm -rf ${file}`.quiet()
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

export default defineCommand({
  command: "init",
  describe: "Initialize project and clean up template files",
  handler: async () => {
    consola.info("Starting project setup...")

    try {
      const projectName = await consola.prompt(
        "Enter your project name (for @[project-name] monorepo alias). Leave as 'init' or empty to skip renaming.",
        {
          cancel: "undefined",
          default: "init",
          placeholder: "init",
          type: "text",
        }
      )

      if (projectName === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      const selectedApps = await consola.prompt(
        "Select apps to keep (all others will be removed)",
        {
          cancel: "undefined",
          options: workspaces.apps.map((app) => ({
            label: app.description,
            value: app.name,
          })),
          type: "multiselect",
        }
      )

      if (selectedApps === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      // Fix an issue with the type returned by the multiselect prompt
      const apps = selectedApps.map((app) => (typeof app === "string" ? app : app.value))

      // Get all package dependencies from selected apps
      const requiredPackages = new Set<string>()
      for (const app of apps) {
        const foundApp = workspaces.apps.find((a) => a.name === app)
        if (foundApp?.dependencies) {
          for (const dep of foundApp.dependencies) {
            requiredPackages.add(dep)
          }
        }
      }

      const selectedPackages = await consola.prompt(
        "Select packages to keep (all others will be removed). We've automatically selected packages that are required by the selected apps.",
        {
          cancel: "undefined",
          initial: Array.from(requiredPackages),
          options: workspaces.packages.map((pkg) => ({
            label: pkg.description,
            value: pkg.name,
          })),
          type: "multiselect",
        }
      )

      if (selectedPackages === undefined) {
        throw new Error("Setup cancelled. No changes have been made.")
      }

      // Fix an issue with the type returned by the multiselect prompt
      const packages = selectedPackages.map((pkg) => (typeof pkg === "string" ? pkg : pkg.value))

      await removeUnselectedWorkspaces(apps, packages)

      if (projectName !== "init") {
        consola.start("Updating project name in package.json...")
        await updatePackageJson(projectName)
        consola.success("Project name updated in package.json.")

        consola.start("Replacing @init with project name in project files...")
        await replaceProjectNameInProjectFiles(projectName)
        consola.success("Project name replaced in project files.")
      }

      consola.start("Setting up environment files for workspaces...")
      await setupEnvironmentVariables([
        ...apps.map((app) => `apps/${app}`),
        ...packages.map((pkg) => `packages/${pkg}`),
      ])
      consola.success("Environment files setup complete.")

      consola.start("Initializing Git repository...")
      await setupGit()
      consola.success("Git repository initialized.")

      consola.start("Cleaning up internal template files...")
      await cleanupInternalFiles()
      consola.success("Internal template files removed.")

      consola.start("Creating new README...")
      await createNewReadme(projectName)
      consola.success("README created.")

      consola.start("Re-installing dependencies...")
      await Bun.$`bun install`
      consola.success("Dependencies installed.")

      consola.success("🎉 All setup steps complete! Your project is ready.")
    } catch (error) {
      consola.error(
        `Operation cancelled: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  },
})
