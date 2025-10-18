import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { readFile, rm, rmdir, writeFile } from "node:fs/promises"
import process from "node:process"
import {
  cancel,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  spinner,
  text,
} from "@clack/prompts"
import { defineCommand } from "citty"
import {
  fileExists,
  replaceProjectNameInProjectFiles,
  workspaces,
} from "../utils"

const OWNER = "metaideas"
const REPO = "init"
const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/i

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

async function promptForProjectName() {
  const projectName = await text({
    message: "What do you want to name your project?",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Project name is required."
      }
    },
  })

  if (isCancel(projectName)) {
    cancel("Please provide a name for your project.")
    process.exit(1)
  }

  return projectName
}

async function selectApps(): Promise<string[]> {
  const apps = await multiselect({
    message: "Select apps to keep (all others will be removed)",
    options: workspaces.apps.map((app) => ({
      label: app.description,
      value: app.name,
    })),
  })

  if (isCancel(apps)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return apps as string[]
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
      label: pkg.description,
      value: pkg.name,
    })),
    initialValues: Array.from(requiredPackages),
  })

  if (isCancel(packages)) {
    throw new Error("Setup cancelled. No changes have been made.")
  }

  return packages as string[]
}

async function removeUnselectedWorkspaces(
  apps: string[],
  packages: string[],
  projectDir: string
) {
  const appsToRemove = workspaces.apps
    .filter((app) => !apps.includes(app.name))
    .map((app) => `${projectDir}/apps/${app.name}`)
  const packagesToRemove = workspaces.packages
    .filter((pkg) => !packages.includes(pkg.name))
    .map((pkg) => `${projectDir}/packages/${pkg.name}`)

  const tasks = [...appsToRemove, ...packagesToRemove].map(async (path) => {
    try {
      await rmdir(path, { recursive: true })
    } catch {
      // Failed to remove directory, continuing...
    }
  })

  await Promise.all(tasks)
}

async function updatePackageJson(projectName: string, projectDir: string) {
  const packageJsonPath = `${projectDir}/package.json`
  const content = await readFile(packageJsonPath, "utf-8")
  const packageJson = JSON.parse(content)

  packageJson.name = projectName
  packageJson.version = "0.0.1"
  await writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf-8"
  )
}

async function setupEnvironmentVariables(paths: string[], projectDir: string) {
  const tasks = paths.map(async (workspacePath) => {
    try {
      const examplePath = `${projectDir}/${workspacePath}/.env.example`
      const localPath = `${projectDir}/${workspacePath}/.env.local`

      // Check if .env.local already exists
      if (await fileExists(localPath)) {
        return
      }

      // Try to copy .env.example to .env.local
      const content = await readFile(examplePath, "utf-8")
      await writeFile(localPath, content, "utf-8")
    } catch {
      // Do nothing for now
    }
  })

  await Promise.all(tasks)
}

async function cleanupInternalFiles(projectDir: string) {
  const filesToRemove = [
    "release-please-config.json",
    ".github/workflows/release.yml",
    "__tests__",
    "cli",
    "scripts",
  ]

  const tasks = filesToRemove.map(async (file) => {
    try {
      await rm(`${projectDir}/${file}`, { recursive: true, force: true })
    } catch {
      // File doesn't exist or failed to remove, continuing...
    }
  })

  await Promise.all(tasks)
}

async function createNewReadme(projectName: string, projectDir: string) {
  await writeFile(
    `${projectDir}/README.md`,
    `
<div align="center">
  <h1 align="center"><code>${projectName}</code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `,
    "utf-8"
  )
}

async function setupGit(projectDir: string) {
  const isInitialized = await fileExists(`${projectDir}/.git`)

  if (isInitialized) {
    return
  }

  try {
    execSync("git init", { cwd: projectDir })
  } catch (error) {
    throw new Error(`Failed to initialize Git: ${error}`)
  }
}

export default defineCommand({
  meta: {
    name: "setup",
    description: "Set up a new project with init",
  },
  args: {
    name: {
      description: "The name of your project",
      type: "positional",
      required: false,
    },
  },
  run: async ({ args }) => {
    intro(title)

    try {
      let name = args.name

      if (!name) {
        name = await promptForProjectName()
      }

      name = name.trim()

      if (!PROJECT_NAME_REGEX.test(name.trim())) {
        throw new Error(
          "Project name can only contain letters, numbers, hyphens, and underscores."
        )
      }

      if (existsSync(name)) {
        throw new Error("Directory already exists.")
      }

      const s1 = spinner()
      s1.start("Cloning template repository...")

      execSync(`git clone https://github.com/${OWNER}/${REPO} ${name} --depth 1`)

      s1.stop("Template repository cloned.")

      // Now do the setup/initialization in the new directory
      log.info("Starting project setup...")

      const selectedApps = await selectApps()
      const selectedPackages = await selectPackages(selectedApps)

      const s2 = spinner()
      s2.start("Removing unselected workspaces...")
      await removeUnselectedWorkspaces(selectedApps, selectedPackages, name)
      s2.stop("Unselected workspaces removed.")

      const s3 = spinner()
      s3.start("Updating project name in package.json...")
      await updatePackageJson(name, name)
      s3.stop("Project name updated in package.json.")

      const s4 = spinner()
      s4.start("Replacing @init with project name in project files...")
      // Change to project directory for file operations
      const originalDir = process.cwd()
      process.chdir(name)
      await replaceProjectNameInProjectFiles(name)
      process.chdir(originalDir)
      s4.stop("Project name replaced in project files.")

      const s5 = spinner()
      s5.start("Setting up environment files for workspaces...")
      await setupEnvironmentVariables(
        [
          ...selectedApps.map((app) => `apps/${app}`),
          ...selectedPackages.map((pkg) => `packages/${pkg}`),
        ],
        name
      )
      s5.stop("Environment files setup complete.")

      const s6 = spinner()
      s6.start("Initializing Git repository...")
      await setupGit(name)
      s6.stop("Git repository initialized.")

      const s7 = spinner()
      s7.start("Cleaning up internal template files...")
      await cleanupInternalFiles(name)
      s7.stop("Internal template files removed.")

      const s8 = spinner()
      s8.start("Creating new README...")
      await createNewReadme(name, name)
      s8.stop("README created.")

      const s9 = spinner()
      s9.start("Installing dependencies...")
      execSync("bun install", { cwd: name, stdio: "ignore" })
      s9.stop("Dependencies installed.")

      log.success(`Created "${name}" using ▶︎ init.`)
      log.message(`Run \`cd ${name}\` to get started.`)
      outro(
        "🎉 All setup complete! Your project is ready. Build something great! 🚀"
      )
    } catch (error) {
      cancel(`Operation cancelled: ${error}`)
      process.exit(1)
    }
  },
})
