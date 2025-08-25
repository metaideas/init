import Bun from "bun"
import { copyFile, mkdir, readdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { cancel, intro, log, outro, spinner } from "@clack/prompts"
import { Octokit } from "@octokit/rest"
import { executeCommand, getVersion } from "./utils"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "https://github.com/metaideas/init.git"
const TEMPLATE_VERSION_FILE = ".template-version.json"

async function cloneTemplate() {
  // Use HTTPS URL and add flags to avoid interactive prompts
  await executeCommand(`git clone ${REMOTE_URL} ${TEMP_DIR} --depth 1 --quiet`)
}

async function getLatestRelease(): Promise<{
  tagName: string
  name: string
  publishedAt: string
  body: string
} | null> {
  try {
    const octokit = new Octokit()
    const response = await octokit.repos.getLatestRelease({
      owner: "metaideas",
      repo: "init",
    })

    return {
      tagName: response.data.tag_name,
      name: response.data.name || "",
      publishedAt: response.data.published_at || "",
      body: response.data.body || "",
    }
  } catch {
    return null
  }
}

const VERSION_PREFIX = /^v/

async function updateTemplateVersion(version: string): Promise<void> {
  const data = { ".": version }
  await Bun.write(TEMPLATE_VERSION_FILE, `${JSON.stringify(data, null, 2)}\n`)
}

function compareVersions(current: string, latest: string): number {
  // Remove 'v' prefix if present
  const currentClean = current.replace(VERSION_PREFIX, "")
  const latestClean = latest.replace(VERSION_PREFIX, "")

  const currentParts = currentClean.split(".").map(Number)
  const latestParts = latestClean.split(".").map(Number)

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0
    const latestPart = latestParts[i] || 0

    if (currentPart < latestPart) {
      return -1
    }
    if (currentPart > latestPart) {
      return 1
    }
  }

  return 0
}

async function getTemplateFiles(): Promise<string[]> {
  const output = await executeCommand(`git -C ${TEMP_DIR} ls-files`)
  return output.split("\n").filter(Boolean)
}

async function getLocalFiles(): Promise<string[]> {
  const output = await executeCommand("git ls-files")
  return output.split("\n").filter(Boolean)
}

async function getFileDiff(localFiles: string[], templateFiles: string[]) {
  const filesToUpdate: string[] = []
  const newFiles: string[] = []

  const fileChecks = await Promise.all(
    templateFiles.map(async (file) => {
      const isNew = !localFiles.includes(file)
      const hasLocalChanges = await executeCommand(
        `git diff --quiet HEAD -- ${file}`
      )
        .then(() => false)
        .catch(() => true)

      return { file, isNew, hasLocalChanges }
    })
  )

  for (const { file, isNew, hasLocalChanges } of fileChecks) {
    if (isNew) {
      newFiles.push(file)
    } else if (!hasLocalChanges) {
      filesToUpdate.push(file)
    }
  }

  return { filesToUpdate, newFiles }
}

async function copyFiles(files: string[]) {
  await Promise.all(
    files.map(async (file) => {
      const source = join(TEMP_DIR, file)
      const dest = join(process.cwd(), file)

      await mkdir(dirname(dest), { recursive: true })
      await copyFile(source, dest)
    })
  )
}

async function getExistingWorkspaceNames(
  workspaceRoot: "apps" | "packages"
): Promise<Set<string>> {
  try {
    const entries = await readdir(join(process.cwd(), workspaceRoot), {
      withFileTypes: true,
    })
    return new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name))
  } catch {
    // If the directory doesn't exist, treat as no existing workspaces
    return new Set()
  }
}

async function filterNewFilesForExistingWorkspaces(
  newFiles: string[]
): Promise<string[]> {
  const [existingApps, existingPackages] = await Promise.all([
    getExistingWorkspaceNames("apps"),
    getExistingWorkspaceNames("packages"),
  ])

  return newFiles.filter((filePath) => {
    if (filePath.startsWith("apps/")) {
      const [, appName] = filePath.split("/")
      return existingApps.has(appName)
    }
    if (filePath.startsWith("packages/")) {
      const [, packageName] = filePath.split("/")
      return existingPackages.has(packageName)
    }
    // For any files outside apps/ or packages/, allow them by default
    return true
  })
}

async function checkVersionUpdates() {
  const [currentVersion, latestRelease] = await Promise.all([
    getVersion(),
    getLatestRelease(),
  ])

  if (latestRelease) {
    const latestVersion = latestRelease.tagName

    if (currentVersion) {
      const comparison = compareVersions(currentVersion, latestVersion)
      if (comparison === 0) {
        return {
          shouldExit: true,
          latestRelease,
          message: `Already up to date (${currentVersion})`,
        }
      }
      if (comparison > 0) {
        return {
          shouldExit: false,
          latestRelease,
          warning: `Local version (${currentVersion}) is newer than latest release (${latestVersion})`,
        }
      }
      const releaseNotes = latestRelease.body
        ? `\nRelease notes:\n${latestRelease.body}`
        : ""
      return {
        shouldExit: false,
        latestRelease,
        message: `Update available: ${currentVersion} → ${latestVersion}${releaseNotes}`,
      }
    }
    return {
      shouldExit: false,
      latestRelease,
      message: `Latest version available: ${latestVersion}`,
    }
  }
  return {
    shouldExit: false,
    latestRelease,
    warning: "No template releases found, proceeding with latest main branch",
  }
}

async function verifyCleanWorkingTree() {
  const hasChanges = await checkForUncommittedChanges()
  if (hasChanges) {
    throw new Error("Please commit or stash changes before syncing")
  }
}

async function setupTempDirectory() {
  await rm(TEMP_DIR, { recursive: true, force: true })
  await mkdir(TEMP_DIR, { recursive: true })
}

async function cloneAndAnalyze() {
  await cloneTemplate()

  const [localFiles, templateFiles] = await Promise.all([
    getLocalFiles(),
    getTemplateFiles(),
  ])

  const { filesToUpdate, newFiles } = await getFileDiff(
    localFiles,
    templateFiles
  )

  return { filesToUpdate, newFiles }
}

async function applyChanges(
  filesToCopy: string[],
  latestRelease: { tagName: string } | null
) {
  // Update existing files and add only new files that belong to existing workspaces
  const uniqueFilesToCopy = Array.from(new Set(filesToCopy))
  await copyFiles(uniqueFilesToCopy)

  await executeCommand("git add .")

  if (latestRelease) {
    await updateTemplateVersion(latestRelease.tagName)
    await executeCommand("git add .template-version.json")
  }
}

async function checkForUncommittedChanges(): Promise<boolean> {
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

export default async function update() {
  intro("Starting template synchronization")

  try {
    const s1 = spinner()
    s1.start("Checking for template updates...")
    const { shouldExit, latestRelease, message, warning } =
      await checkVersionUpdates()
    s1.stop("Template version check complete.")

    if (message) {
      log.info(message)
    }
    if (warning) {
      log.warn(warning)
    }
    if (shouldExit) {
      return
    }

    const s2 = spinner()
    s2.start("Checking for uncommitted changes...")
    await verifyCleanWorkingTree()
    s2.stop("Working directory clean.")

    const s3 = spinner()
    s3.start("Setting up temporary directory...")
    await setupTempDirectory()
    s3.stop("Temporary directory created.")

    const s4 = spinner()
    s4.start("Cloning template repository...")
    const { filesToUpdate, newFiles } = await cloneAndAnalyze()
    s4.stop("Template repository cloned.")

    const allowedNewFiles = await filterNewFilesForExistingWorkspaces(newFiles)
    const filesToCopy = [...filesToUpdate, ...allowedNewFiles]

    if (filesToCopy.length === 0) {
      log.info("No updates to apply - already up to date")
      return
    }

    const s6 = spinner()
    s6.start("Applying template changes...")
    await applyChanges(filesToCopy, latestRelease)
    s6.stop("Template changes applied.")

    log.success("Changes staged")
    log.info(
      "Template sync completed. Please review the changes and commit them to your repository."
    )
    outro("🎉 Template sync completed successfully!")
  } catch (error) {
    cancel(
      `Sync failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    )
    process.exit(1)
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true })
  }
}
