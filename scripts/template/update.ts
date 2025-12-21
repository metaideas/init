import Bun from "bun"
import { dirname, join } from "node:path"
import consola from "consola"
import { defineCommand } from "../helpers"
import { compareVersions, getLatestRelease, getVersion, updateTemplateVersion } from "./utils"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "https://github.com/metaideas/init.git"

async function cloneTemplate() {
  // Use HTTPS URL and add flags to avoid interactive prompts
  await Bun.$`git clone ${REMOTE_URL} ${TEMP_DIR} --depth 1 --quiet`
}

async function getTemplateFiles(): Promise<string[]> {
  const output = await Bun.$`git -C ${TEMP_DIR} ls-files`.text()
  return output.split("\n").filter(Boolean)
}

async function getLocalFiles(): Promise<string[]> {
  const output = await Bun.$`git ls-files`.text()
  return output.split("\n").filter(Boolean)
}

async function getFileDiff(localFiles: string[], templateFiles: string[]) {
  const filesToUpdate: string[] = []
  const newFiles: string[] = []

  const fileChecks = await Promise.all(
    templateFiles.map(async (file) => {
      const isNew = !localFiles.includes(file)
      const hasLocalChanges = await Bun.$`git diff --quiet HEAD -- ${file}`
        .quiet()
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

      await Bun.$`mkdir -p ${dirname(dest)}`.quiet()
      await Bun.write(dest, await Bun.file(source).arrayBuffer())
    })
  )
}

async function getExistingWorkspaceNames(workspaceRoot: "apps" | "packages"): Promise<Set<string>> {
  try {
    // List directories only, get basename of each
    const output =
      await Bun.$`sh -c "for dir in ${workspaceRoot}/*/; do [ -d \"\$dir\" ] && basename \"\$dir\"; done"`.text()
    return new Set(output.split("\n").filter(Boolean))
  } catch {
    // If the directory doesn't exist or is empty, treat as no existing workspaces
    return new Set()
  }
}

async function filterNewFilesForExistingWorkspaces(newFiles: string[]): Promise<string[]> {
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
  const [currentVersion, latestRelease] = await Promise.all([getVersion(), getLatestRelease()])

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
      const releaseNotes = latestRelease.body ? `\nRelease notes:\n${latestRelease.body}` : ""
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
  await Bun.$`rm -rf ${TEMP_DIR}`.quiet().catch(() => {
    // Directory doesn't exist, that's fine
  })
  await Bun.$`mkdir -p ${TEMP_DIR}`.quiet()
}

async function cloneAndAnalyze() {
  await cloneTemplate()

  const [localFiles, templateFiles] = await Promise.all([getLocalFiles(), getTemplateFiles()])

  const { filesToUpdate, newFiles } = await getFileDiff(localFiles, templateFiles)

  return { filesToUpdate, newFiles }
}

async function applyChanges(filesToCopy: string[], latestRelease: { tagName: string } | null) {
  // Update existing files and add only new files that belong to existing workspaces
  const uniqueFilesToCopy = Array.from(new Set(filesToCopy))
  await copyFiles(uniqueFilesToCopy)

  await Bun.$`git add .`

  if (latestRelease) {
    await updateTemplateVersion(latestRelease.tagName)
    await Bun.$`git add .template-version.json`
  }
}

async function checkForUncommittedChanges(): Promise<boolean> {
  const status = await Bun.$`git status --porcelain`.text()
  return status.length > 0
}

export default defineCommand({
  command: "update",
  describe: "Sync with template updates",
  handler: async () => {
    consola.info("Starting template synchronization")

    try {
      consola.start("Checking for template updates...")
      const { shouldExit, latestRelease, message, warning } = await checkVersionUpdates()
      consola.success("Template version check complete.")

      if (message) {
        consola.info(message)
      }
      if (warning) {
        consola.warn(warning)
      }
      if (shouldExit) {
        return
      }

      consola.start("Checking for uncommitted changes...")
      await verifyCleanWorkingTree()
      consola.success("Working directory clean.")

      consola.start("Setting up temporary directory...")
      await setupTempDirectory()
      consola.success("Temporary directory created.")

      consola.start("Cloning template repository...")
      const { filesToUpdate, newFiles } = await cloneAndAnalyze()
      consola.success("Template repository cloned.")

      const allowedNewFiles = await filterNewFilesForExistingWorkspaces(newFiles)
      const filesToCopy = [...filesToUpdate, ...allowedNewFiles]

      if (filesToCopy.length === 0) {
        consola.info("No updates to apply - already up to date")
        return
      }

      consola.start("Applying template changes...")
      await applyChanges(filesToCopy, latestRelease)
      consola.success("Template changes applied.")

      consola.success("Changes staged")
      consola.info(
        "Template sync completed. Please review the changes and commit them to your repository."
      )
      consola.success("🎉 Template sync completed successfully!")
    } catch (error) {
      consola.error(
        `Sync failed: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      )
      process.exit(1)
    } finally {
      await Bun.$`rm -rf ${TEMP_DIR}`.quiet().catch(() => {
        // Failed to remove temp directory, that's fine
      })
    }
  },
})
