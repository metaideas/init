import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import { dirname, join } from "node:path"
import * as prompt from "@clack/prompts"
import { Octokit } from "@octokit/rest"
import {
  REMOTE_HTTPS_URL,
  TEMP_DIR,
  TEMPLATE_VERSION_FILE,
} from "../lib/constants"
import { executeCommand } from "../lib/exec"
import {
  cloneRepository,
  getGitFiles,
  getGitFilesInDirectory,
  hasFileChanges,
  hasUncommittedChanges,
  stageAll,
  stageFile,
} from "../lib/git"

async function cloneTemplate(): Promise<void> {
  await cloneRepository(REMOTE_HTTPS_URL, TEMP_DIR, ["--depth", "1", "--quiet"])
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

async function getCurrentTemplateVersion(): Promise<string | null> {
  try {
    const version = await readFile(TEMPLATE_VERSION_FILE, "utf-8")
    return version.trim()
  } catch {
    return null
  }
}

async function updateTemplateVersion(version: string): Promise<void> {
  await writeFile(TEMPLATE_VERSION_FILE, version, "utf-8")
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
  return await getGitFilesInDirectory(TEMP_DIR)
}

async function getLocalFiles(): Promise<string[]> {
  return await getGitFiles()
}

async function getFileDiff(localFiles: string[], templateFiles: string[]) {
  const filesToUpdate: string[] = []
  const newFiles: string[] = []

  const fileChecks = await Promise.all(
    templateFiles.map(async (file) => {
      const isNew = !localFiles.includes(file)
      const hasLocalChanges = await hasFileChanges(file)

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

async function copyFiles(files: string[]): Promise<void> {
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
    // Exclude CLI and scripts directories
    if (filePath.startsWith("cli/") || filePath.startsWith("scripts/")) {
      return false
    }

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
    getCurrentTemplateVersion(),
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

async function verifyCleanWorkingTree(): Promise<void> {
  const hasChanges = await hasUncommittedChanges()
  if (hasChanges) {
    throw new Error("Please commit or stash changes before syncing")
  }
}

async function setupTempDirectory(): Promise<void> {
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
): Promise<void> {
  // Update existing files and add only new files that belong to existing workspaces
  const uniqueFilesToCopy = Array.from(new Set(filesToCopy))
  await copyFiles(uniqueFilesToCopy)

  await stageAll()

  if (latestRelease) {
    await updateTemplateVersion(latestRelease.tagName)
    await stageFile(TEMPLATE_VERSION_FILE)
  }
}

async function update(): Promise<void> {
  prompt.intro("Starting template synchronization")

  try {
    // Check if we're in a project directory
    try {
      await access("package.json")
    } catch {
      throw new Error(
        "Please run this command from the root of your project (where package.json is located)"
      )
    }

    const s1 = prompt.spinner()
    s1.start("Checking for template updates...")
    const { shouldExit, latestRelease, message, warning } =
      await checkVersionUpdates()
    s1.stop("Template version check complete.")

    if (message) {
      prompt.log.info(message)
    }
    if (warning) {
      prompt.log.warn(warning)
    }
    if (shouldExit) {
      return
    }

    const s2 = prompt.spinner()
    s2.start("Checking for uncommitted changes...")
    await verifyCleanWorkingTree()
    s2.stop("Working directory clean.")

    const s3 = prompt.spinner()
    s3.start("Setting up temporary directory...")
    await setupTempDirectory()
    s3.stop("Temporary directory created.")

    const s4 = prompt.spinner()
    s4.start("Cloning template repository...")
    const { filesToUpdate, newFiles } = await cloneAndAnalyze()
    s4.stop("Template repository cloned.")

    const allowedNewFiles = await filterNewFilesForExistingWorkspaces(newFiles)
    const filesToCopy = [...filesToUpdate, ...allowedNewFiles]

    if (filesToCopy.length === 0) {
      prompt.log.info("No updates to apply - already up to date")
      return
    }

    const s6 = prompt.spinner()
    s6.start("Applying template changes...")
    await applyChanges(filesToCopy, latestRelease)
    s6.stop("Template changes applied.")

    prompt.log.success("Changes staged")
    prompt.log.info(
      "Template sync completed. Please review the changes and commit them to your repository."
    )
    prompt.outro("🎉 Template sync completed successfully!")
  } catch (error) {
    prompt.cancel(
      `Sync failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    )
    process.exit(1)
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true })
  }
}

export default update
