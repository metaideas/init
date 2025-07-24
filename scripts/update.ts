import { copyFile, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { executeCommand, prompt } from "@tooling/helpers"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "https://github.com/metaideas/init.git"
const GITHUB_API_URL = "https://api.github.com/repos/metaideas/init"
const TEMPLATE_VERSION_FILE = ".template-version"

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
    const response = await fetch(`${GITHUB_API_URL}/releases/latest`)
    if (!response.ok) {
      if (response.status === 404) {
        return null // No releases yet
      }
      throw new Error(`Failed to fetch latest release: ${response.statusText}`)
    }
    return await response.json()
  } catch {
    return null
  }
}

const VERSION_PREFIX = /^v/

async function getCurrentTemplateVersion(): Promise<string | null> {
  try {
    const { readFile } = await import("node:fs/promises")
    const version = await readFile(TEMPLATE_VERSION_FILE, "utf-8")
    return version.trim()
  } catch {
    return null
  }
}

async function updateTemplateVersion(version: string): Promise<void> {
  const { writeFile } = await import("node:fs/promises")
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

async function checkVersionUpdates() {
  const s1 = prompt.spinner()
  s1.start("Checking for template updates")

  const [currentVersion, latestRelease] = await Promise.all([
    getCurrentTemplateVersion(),
    getLatestRelease(),
  ])

  if (latestRelease) {
    const latestVersion = latestRelease.tagName
    s1.stop(`Latest template version: ${latestVersion}`)

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
  s1.stop("No releases found")
  return {
    shouldExit: false,
    latestRelease,
    warning: "No template releases found, proceeding with latest main branch",
  }
}

async function verifyCleanWorkingTree() {
  const s2 = prompt.spinner()
  s2.start("Checking for uncommitted changes")

  const hasChanges = await checkForUncommittedChanges()
  if (hasChanges) {
    throw new Error("Please commit or stash changes before syncing")
  }

  s2.stop("Working directory clean")
}

async function setupTempDirectory() {
  const s3 = prompt.spinner()
  s3.start("Setting up temporary directory")

  await rm(TEMP_DIR, { recursive: true, force: true })
  await mkdir(TEMP_DIR, { recursive: true })

  s3.stop("Temporary directory created")
}

async function cloneAndAnalyze() {
  const s4 = prompt.spinner()
  s4.start("Cloning template repository")

  await cloneTemplate()

  s4.stop("Template cloned")

  const s5 = prompt.spinner()
  s5.start("Analyzing file differences")

  const [localFiles, templateFiles] = await Promise.all([
    getLocalFiles(),
    getTemplateFiles(),
  ])

  const { filesToUpdate, newFiles } = await getFileDiff(
    localFiles,
    templateFiles
  )

  s5.stop(
    `Found ${filesToUpdate.length} updates and ${newFiles.length} new files`
  )

  return { filesToUpdate, newFiles }
}

async function applyChanges(
  filesToUpdate: string[],
  newFiles: string[],
  latestRelease: { tagName: string } | null
) {
  const s6 = prompt.spinner()
  s6.start("Applying template changes")

  await Promise.all([copyFiles(filesToUpdate), copyFiles(newFiles)])

  s6.stop("Changes applied")

  await executeCommand("git add .")

  if (latestRelease) {
    await updateTemplateVersion(latestRelease.tagName)
    await executeCommand("git add .template-version")
  }
}

async function update() {
  prompt.intro("Starting template synchronization")

  try {
    const { shouldExit, latestRelease, message, warning } =
      await checkVersionUpdates()

    if (message) {
      prompt.log.info(message)
    }
    if (warning) {
      prompt.log.warn(warning)
    }
    if (shouldExit) {
      return
    }

    await verifyCleanWorkingTree()
    await setupTempDirectory()

    const { filesToUpdate, newFiles } = await cloneAndAnalyze()

    if (filesToUpdate.length === 0 && newFiles.length === 0) {
      prompt.log.info("No changes to apply - already up to date")
      return
    }

    await applyChanges(filesToUpdate, newFiles, latestRelease)

    prompt.log.success("Changes staged")
    prompt.log.message(
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

async function checkForUncommittedChanges(): Promise<boolean> {
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

export default update
