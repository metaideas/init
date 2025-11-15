import { log, spinner } from "@clack/prompts"
import { defineCommand } from "../../tooling/helpers"
import { compareVersions, getLatestRelease, getVersion } from "./utils"

export default defineCommand({
  command: "check",
  describe: "Check template version",
  handler: async () => {
    try {
      const s = spinner()
      s.start("Checking for template updates...")
      const [currentVersion, latestRelease] = await Promise.all([
        getVersion(),
        getLatestRelease(),
      ])
      s.stop("Template version check complete.")

      if (!latestRelease) {
        log.warn("No template releases found")
        return
      }

      const latestVersion = latestRelease.tagName

      log.info(`Current template version: ${currentVersion || "Unknown"}`)
      log.info(`Latest template version: ${latestVersion}`)

      if (!currentVersion) {
        log.warn(
          "No local template version found. Run 'bun template update' to initialize."
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
        log.message("Run 'bun template update' to update your template")

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
  },
})
