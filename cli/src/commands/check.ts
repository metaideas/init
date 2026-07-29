import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { Prompter } from "#lib/services/prompter.ts"
import { getTemplateVersionStatus } from "#lib/templates/releases.ts"
import { requireInitProject } from "#lib/templates/versions.ts"

export default Command.make("check").pipe(
  Command.withDescription("Check template version"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      const prompter = yield* Prompter

      yield* prompter.intro("🔍 Template Version Check")
      yield* prompter.log.info("Checking for template updates...")

      const version = yield* getTemplateVersionStatus()
      const latestVersion = version.latestRelease.tagName

      yield* prompter.log.info(`Current: ${version.currentVersion ?? "Unknown"}`)
      yield* prompter.log.info(`Latest: ${latestVersion}`)

      if (version.status === "unknown") {
        yield* prompter.log.warning(
          "No local template version found. Run 'init-now update' to initialize."
        )
        yield* prompter.outro("⚠️ Template version is unknown.")
        return
      }

      if (version.status === "current") {
        yield* prompter.outro("✅ Template is up to date!")
      } else if (version.status === "ahead") {
        yield* prompter.log.warning(
          `Local version (${version.currentVersion}) is newer than latest release (${latestVersion})`
        )
        yield* prompter.outro("⚠️ Local template is newer than the latest release.")
      } else {
        yield* prompter.log.info(`Update available: ${version.currentVersion} → ${latestVersion}`)
        yield* prompter.log.info("Run 'init-now update' to update your template")
        if (version.latestRelease.body) {
          yield* prompter.log.info(`Release notes:\n${version.latestRelease.body}`)
        }
        yield* prompter.outro("🆙 Template update available")
      }
    })
  )
)
