import { copyFile, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { cancel, log, spinner } from "@clack/prompts"
import { executeCommand, runScript } from "../tooling/helpers"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "git@github.com:metaideas/init.git"
const GITHUB_API_URL = "https://api.github.com/repos/metaideas/init"
const TEMPLATE_VERSION_FILE = ".template-version"

async function cloneTemplate() {
  await executeCommand(`git clone ${REMOTE_URL} ${TEMP_DIR} --depth 1`)
}

async function getLatestRelease(): Promise<{ tag_name: string; name: string; published_at: string; body: string } | null> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/releases/latest`)
    if (!response.ok) {
      if (response.status === 404) {
        return null // No releases yet
      }
      throw new Error(`Failed to fetch latest release: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    log.warn(`Could not fetch latest release: ${error instanceof Error ? error.message : "Unknown error"}`)
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
  const currentClean = current.replace(VERSION_PREFIX, '')
  const latestClean = latest.replace(VERSION_PREFIX, '')
  
  const currentParts = currentClean.split('.').map(Number)
  const latestParts = latestClean.split('.').map(Number)
  
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

async function main() {
  log.message("Starting template synchronization")

  const s = spinner()
  try {
    // Check for version updates
    s.start("Checking for template updates")
    const [currentVersion, latestRelease] = await Promise.all([
      getCurrentTemplateVersion(),
      getLatestRelease()
    ])
    
    if (latestRelease) {
      const latestVersion = latestRelease.tag_name
      s.stop(`Latest template version: ${latestVersion}`)
      
      if (currentVersion) {
        const comparison = compareVersions(currentVersion, latestVersion)
        if (comparison === 0) {
          log.info(`Already up to date (${currentVersion})`)
          return
        } else if (comparison > 0) {
          log.warn(`Local version (${currentVersion}) is newer than latest release (${latestVersion})`)
        } else {
          log.info(`Update available: ${currentVersion} → ${latestVersion}`)
          if (latestRelease.body) {
            log.message("Release notes:")
            log.message(latestRelease.body)
          }
        }
      } else {
        log.info(`Latest version available: ${latestVersion}`)
      }
    } else {
      s.stop("No releases found")
      log.warn("No template releases found, proceeding with latest main branch")
    }

    // Verify clean working tree
    s.start("Checking for uncommitted changes")
    const hasChanges = await checkForUncommittedChanges()
    if (hasChanges) {
      cancel("Please commit or stash changes before syncing")
      process.exit(1)
    }
    s.stop("Working directory clean")

    // Set up temporary environment
    s.start("Setting up temporary directory")
    await rm(TEMP_DIR, { recursive: true, force: true })
    await mkdir(TEMP_DIR, { recursive: true })
    s.stop("Temporary directory created")

    // Clone template
    s.start("Cloning template repository")
    await cloneTemplate()
    s.stop("Template cloned")

    // Get file lists
    s.start("Analyzing file differences")
    const [localFiles, templateFiles] = await Promise.all([
      getLocalFiles(),
      getTemplateFiles(),
    ])

    const { filesToUpdate, newFiles } = await getFileDiff(
      localFiles,
      templateFiles
    )
    s.stop(
      `Found ${filesToUpdate.length} updates and ${newFiles.length} new files`
    )

    if (filesToUpdate.length === 0 && newFiles.length === 0) {
      log.info("No changes to apply - already up to date")
      return
    }

    // Copy changes
    s.start("Applying template changes")
    await Promise.all([copyFiles(filesToUpdate), copyFiles(newFiles)])
    s.stop("Changes applied")

    // Stage changes and set commit message
    await executeCommand("git add .")

    // Update template version file if we have release information
    if (latestRelease) {
      await updateTemplateVersion(latestRelease.tag_name)
      await executeCommand("git add .template-version")
    }

    log.success("Changes staged")
    log.message(
      "Template sync completed. Please review the changes and commit them to your repository."
    )
  } catch (error) {
    s.stop("Sync failed")
    log.error(error instanceof Error ? error.message : "Unknown error occurred")
    process.exit(1)
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true })
  }
}

async function checkForUncommittedChanges(): Promise<boolean> {
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

runScript(main)
