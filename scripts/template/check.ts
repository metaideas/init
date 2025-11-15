import consola from "consola"
import { defineCommand } from "../helpers"
import { compareVersions, getLatestRelease, getVersion } from "./utils"

export default defineCommand({
  command: "check",
  describe: "Check template version",
  handler: async () => {
    try {
      consola.start("Checking for template updates...")
      const [currentVersion, latestRelease] = await Promise.all([
        getVersion(),
        getLatestRelease(),
      ])
      consola.success("Template version check complete.")

      if (!latestRelease) {
        consola.warn("No template releases found")
        return
      }

      const latestVersion = latestRelease.tagName

      consola.info(`Current template version: ${currentVersion || "Unknown"}`)
      consola.info(`Latest template version: ${latestVersion}`)

      if (!currentVersion) {
        consola.warn(
          "No local template version found. Run 'bun template update' to initialize."
        )
        return
      }

      const comparison = compareVersions(currentVersion, latestVersion)

      if (comparison === 0) {
        consola.success("✅ Template is up to date!")
      } else if (comparison > 0) {
        consola.warn(
          `⚠️  Local version (${currentVersion}) is newer than latest release (${latestVersion})`
        )
      } else {
        consola.info(
          `🆙 Update available: ${currentVersion} → ${latestVersion}`
        )
        consola.log("Run 'bun template update' to update your template")

        if (latestRelease.body) {
          consola.log("Release notes:")
          consola.log(latestRelease.body)
        }
      }
    } catch (error) {
      consola.error(
        `Failed to check for updates: ${error instanceof Error ? error.message : "Unknown error"}`
      )
      process.exit(1)
    }
  },
})
