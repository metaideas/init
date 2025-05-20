import fs from "node:fs"
import path from "node:path"
import {
  cancel,
  intro,
  isCancel,
  log,
  multiselect,
  outro,
  text,
} from "@clack/prompts"
import { executeCommand, runScript } from "../tooling/helpers"
import { REMOTE_URL, Workspaces } from "./consts"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vercel",
  ".DS_Store",
  ".cache",
  ".pnpm-store",
  ".yarn",
] as const

function checkShouldExclude(filePath: string): boolean {
  return EXCLUDED_DIRS.some(
    dir =>
      filePath.includes(`${path.sep}${dir}${path.sep}`) ||
      filePath.endsWith(`${path.sep}${dir}`)
  )
}

function getAllFilesRecursively(dir: string, files: string[] = []): string[] {
  if (checkShouldExclude(dir)) {
    return files
  }

  try {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file)

      if (checkShouldExclude(filePath)) {
        continue
      }

      const stat = fs.statSync(filePath)
      stat.isDirectory()
        ? getAllFilesRecursively(filePath, files)
        : files.push(filePath)
    }
  } catch (error: unknown) {
    log.error(
      `Could not read directory ${dir}: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }

  return files
}

function getReplacementCount(content: string, from: string): number {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
  return (content.match(regex) || []).length
}

async function copyEnvFile(sourcePath: string, targetPath: string) {
  try {
    await fs.promises.access(sourcePath)
    try {
      await fs.promises.access(targetPath)
      log.info(`Skipping ${targetPath} (already exists)`)
      return
    } catch {
      await fs.promises.copyFile(sourcePath, targetPath)
      log.success(`Created ${targetPath}`)
    }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      log.warning(`No example file found at ${sourcePath}`)
      return
    }
    // For other errors, we might want to log them but not necessarily stop the whole script
    // The current implementation logs a warning and continues.
    log.warn(
      `Could not copy ${sourcePath} to ${targetPath}: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

async function setupWorkspaceEnv(workspacePath: string) {
  const workspaceName = path.basename(workspacePath)
  log.step(`Processing ${workspaceName} for .env file...`)
  const envExample = path.join(workspacePath, ".env.template")
  const env = path.join(workspacePath, ".env")
  await copyEnvFile(envExample, env)
}

function removeUnselectedWorkspaces(apps: string[], packages: string[]) {
  log.step("Removing unselected workspaces...")

  const appsToRemove = Workspaces.APPS.map(app => app.name).filter(
    app => !apps.includes(app)
  )
  const packagesToRemove = Workspaces.PACKAGES.map(pkg => pkg.name).filter(
    pkg => !packages.includes(pkg)
  )

  let removedCount = 0

  for (const app of appsToRemove) {
    const appPath = path.join(__dirname, "..", "apps", app)
    if (fs.existsSync(appPath)) {
      fs.rmSync(appPath, { recursive: true, force: true })
      log.success(`Removed apps/${app}`)
      removedCount++
    }
  }

  for (const pkg of packagesToRemove) {
    const pkgPath = path.join(__dirname, "..", "packages", pkg)
    if (fs.existsSync(pkgPath)) {
      fs.rmSync(pkgPath, { recursive: true, force: true })
      log.success(`Removed packages/${pkg}`)
      removedCount++
    }
  }

  if (removedCount > 0) {
    log.info(`Removed ${removedCount} workspace(s).`)
  } else {
    log.info(
      "No workspaces were selected for removal or all selected workspaces were kept."
    )
  }
}

async function promptForProjectName(): Promise<string | null> {
  const projectName = await text({
    message:
      "Enter your project name (for @[project-name] monorepo alias). Leave as 'init' or empty to skip renaming.",
    defaultValue: "init",
    placeholder: "init",
  })

  if (isCancel(projectName)) {
    outro("Setup cancelled.")
    process.exit(0)
  }

  if (!projectName.trim() || projectName === "init") {
    log.info("Skipping project renaming.")
    return null
  }

  return projectName
}

function replaceProjectNameInFiles(projectName: string) {
  const rootDir = path.join(__dirname, "..")
  log.info(
    `Searching for "@init" in project files (excluding node_modules, .git, etc.) to replace with "@${projectName}"...`
  )

  const allFiles = getAllFilesRecursively(rootDir)
  let totalReplacements = 0
  let filesChanged = 0

  for (const file of allFiles) {
    try {
      if (file.endsWith("pnpm-lock.yaml")) {
        continue
      }

      const content = fs.readFileSync(file, "utf8")
      // Check for "@init" to catch instances like "@init/some-package" or "@init" as a whole word.
      if (!content.includes("@init")) {
        continue
      }

      const count = getReplacementCount(content, "@init")
      if (!count) {
        continue
      }

      filesChanged++
      totalReplacements += count

      const replaced = content.split("@init").join(`@${projectName}`)

      fs.writeFileSync(file, replaced, "utf8")
    } catch (error: unknown) {
      if (error instanceof Error) {
        log.warn(
          `Could not process file ${file} for renaming: ${error.message}`
        )

        continue
      }

      log.warn(`Could not process file ${file} for renaming: Unknown error`)
    }
  }

  if (filesChanged > 0) {
    log.success(
      `Replaced ${totalReplacements} instance(s) of '@init' with '@${projectName}' in ${filesChanged} file(s).`
    )

    return
  }

  log.info("No instances of '@init' found to replace in files.")
}

function updatePackageJsonName(projectName: string) {
  const packageJsonPath = path.join(__dirname, "..", "package.json")

  try {
    log.info(`Updating name in ${packageJsonPath}...`)
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8")
    const packageJson = JSON.parse(packageJsonContent)

    const oldName = packageJson.name

    if (oldName === projectName) {
      log.info(
        `Project name in package.json is already "${projectName}". No changes needed.`
      )
      return
    }

    packageJson.name = projectName
    fs.writeFileSync(
      packageJsonPath,
      `${JSON.stringify(packageJson, null, 2)}\n`,
      "utf8"
    )
    log.success(
      `Updated project name in package.json from "${oldName}" to "${projectName}".`
    )
  } catch (error: unknown) {
    let message = "Unknown error"
    if (error instanceof Error) {
      message = error.message
    }
    log.error(`Failed to update package.json name: ${message}`)
  }
}

async function setupEnvironmentVariables(apps: string[], packages: string[]) {
  log.step("Setting up environment files for remaining workspaces...")
  let processedCount = 0

  for (const app of apps) {
    const workspaceDir = path.join(__dirname, "..", "apps", app)
    if (fs.existsSync(workspaceDir)) {
      await setupWorkspaceEnv(workspaceDir)
      processedCount++
    } else {
      log.warn(
        `Workspace directory ${workspaceDir} not found during environment setup. Skipping.`
      )
    }
  }

  for (const pkg of packages) {
    const workspaceDir = path.join(__dirname, "..", "packages", pkg)
    if (fs.existsSync(workspaceDir)) {
      await setupWorkspaceEnv(workspaceDir)
      processedCount++
    } else {
      log.warn(
        `Workspace directory ${workspaceDir} not found during environment setup. Skipping.`
      )
    }
  }

  if (processedCount > 0) {
    log.success(`Processed ${processedCount} workspaces for environment setup.`)

    return
  }

  log.info(
    "No workspaces required environment setup or no workspaces were kept."
  )
}

async function getSelectedApps(): Promise<string[]> {
  const apps = await multiselect({
    message: "Select apps to keep (all others will be removed)",
    options: Workspaces.APPS.map(app => ({
      name: app.description,
      value: app.name,
    })),
  })

  if (isCancel(apps)) {
    cancel("Canceled setup. No changes have been made.")
    process.exit(0)
  }

  return apps
}

async function getSelectedPackages(): Promise<string[]> {
  const packages = await multiselect({
    message: "Select packages to keep (all others will be removed)",
    options: Workspaces.PACKAGES.map(pkg => ({
      name: pkg.description,
      value: pkg.name,
    })),
  })

  if (isCancel(packages)) {
    cancel("Canceled setup. No changes have been made.")
    process.exit(0)
  }

  return packages
}

async function setupRemoteBranch() {
  log.step("Setting up remote template branch for updates...")

  try {
    await executeCommand(`git remote add template ${REMOTE_URL}`)
    log.success("Remote template branch added")
  } catch {
    log.error("Failed to add remote template branch")
    log.warn(
      "If you already have a remote template branch, you can ignore this message"
    )
  }
}

async function main() {
  intro("🚀 Starting project setup wizard!")

  const selectedApps = await getSelectedApps()
  const selectedPackages = await getSelectedPackages()

  await removeUnselectedWorkspaces(selectedApps, selectedPackages)

  const newProjectName = await promptForProjectName()

  if (newProjectName) {
    await replaceProjectNameInFiles(newProjectName)
    await updatePackageJsonName(newProjectName)
    log.success("✅ Project renaming steps complete!")
  }

  await setupEnvironmentVariables(selectedApps, selectedPackages)

  await setupRemoteBranch()

  outro("🎉 All setup steps complete! Your project is ready.")
}

runScript(main)
