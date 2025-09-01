import { log } from "@clack/prompts"
import { getVersion } from "./utils"

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
    log.warn(
      `Could not fetch latest release: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    return null
  }
}

function compareVersions(current: string, latest: string): number {
  const currentParts = current.split(".").map(Number)
  const latestParts = latest.split(".").map(Number)

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

async function check() {
  log.info("Checking for template updates...")

  try {
    const [currentVersion, latestRelease] = await Promise.all([
      getVersion(),
      getLatestRelease(),
    ])

    if (!latestRelease) {
      log.warn("No template releases found")
      return
    }

    const latestVersion = latestRelease.tag_name

    log.info(`Current template version: ${currentVersion || "Unknown"}`)
    log.info(`Latest template version: ${latestVersion}`)

    if (!currentVersion) {
      log.warn(
        "No local template version found. Run 'bun template:sync' to initialize."
      )
      return
    }

    const comparison = compareVersions(currentVersion, latestVersion)

    if (comparison === 0) {
      log.success("✅ Template is up to date!")
    } else if (comparison > 0) {
      log.warn(
        `⚠️  Local version (${currentVersion}) is newer than latest release (${latestVersion})`
      )
    } else {
      log.info(`🆙 Update available: ${currentVersion} → ${latestVersion}`)
      log.message("Run 'bun template:sync' to update your template")

      if (latestRelease.body) {
        log.message("Release notes:")
        log.message(latestRelease.body)
      }
    }
  } catch (error) {
    log.error(
      `Failed to check for updates: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    process.exit(1)
  }
}

export default check
