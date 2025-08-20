import { access, readFile } from "node:fs/promises"
import * as prompt from "@clack/prompts"
import { TEMPLATE_VERSION_FILE } from "../lib/constants"

const GITHUB_API_URL = "https://api.github.com/repos/metaideas/init"

async function getLatestRelease(): Promise<{
  tag_name: string
  name: string
  published_at: string
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
  } catch (error) {
    prompt.log.warn(
      `Could not fetch latest release: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    return null
  }
}

async function getCurrentTemplateVersion(): Promise<string | null> {
  try {
    const version = await readFile(TEMPLATE_VERSION_FILE, "utf-8")
    return version.trim()
  } catch {
    return null
  }
}

const VERSION_PREFIX = /^v/

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

async function check(): Promise<void> {
  try {
    // Check if we're in a project directory
    try {
      await access("package.json")
    } catch {
      throw new Error(
        "Please run this command from the root of your project (where package.json is located)"
      )
    }

    prompt.log.message("Checking for template updates...")

    const [currentVersion, latestRelease] = await Promise.all([
      getCurrentTemplateVersion(),
      getLatestRelease(),
    ])

    if (!latestRelease) {
      prompt.log.warn("No template releases found")
      return
    }

    const latestVersion = latestRelease.tag_name

    prompt.log.info(`Current template version: ${currentVersion || "Unknown"}`)
    prompt.log.info(`Latest template version: ${latestVersion}`)

    if (!currentVersion) {
      prompt.log.warn(
        "No local template version found. Run 'init-now update' to initialize."
      )
      return
    }

    const comparison = compareVersions(currentVersion, latestVersion)

    if (comparison === 0) {
      prompt.log.success("✅ Template is up to date!")
    } else if (comparison > 0) {
      prompt.log.warn(
        `⚠️  Local version (${currentVersion}) is newer than latest release (${latestVersion})`
      )
    } else {
      prompt.log.info(
        `🆙 Update available: ${currentVersion} → ${latestVersion}`
      )
      prompt.log.message("Run 'init-now update' to update your template")

      if (latestRelease.body) {
        prompt.log.message("Release notes:")
        prompt.log.message(latestRelease.body)
      }
    }
  } catch (error) {
    prompt.log.error(
      `Failed to check for updates: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    process.exit(1)
  }
}

export default check
