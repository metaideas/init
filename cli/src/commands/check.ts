import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { Prompter } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { compareVersions, getVersion, requireInitProject } from "#lib/shared/releases.ts"

export default Command.make("check").pipe(
  Command.withDescription("Check template version"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      const releases = yield* ReleaseClient
      const prompter = yield* Prompter

      yield* prompter.intro("🔍 Template Version Check")
      yield* prompter.log.info("Checking for template updates...")

      const [currentVersion, latestRelease] = yield* Effect.all(
        [getVersion(), releases.getLatest()],
        { concurrency: 2 }
      )
      const latestVersion = latestRelease.tagName

      yield* prompter.log.info(`Current: ${currentVersion ?? "Unknown"}`)
      yield* prompter.log.info(`Latest: ${latestVersion}`)

      if (!currentVersion) {
        yield* prompter.log.warning(
          "No local template version found. Run 'init-now update' to initialize."
        )
        yield* prompter.outro("⚠️ Template version is unknown.")
        return
      }

      const comparison = yield* compareVersions(currentVersion, latestVersion)
      if (comparison === 0) {
        yield* prompter.outro("✅ Template is up to date!")
      } else if (comparison > 0) {
        yield* prompter.log.warning(
          `Local version (${currentVersion}) is newer than latest release (${latestVersion})`
        )
        yield* prompter.outro("⚠️ Local template is newer than the latest release.")
      } else {
        yield* prompter.log.info(`Update available: ${currentVersion} → ${latestVersion}`)
        yield* prompter.log.info("Run 'init-now update' to update your template")
        if (latestRelease.body) {
          yield* prompter.log.info(`Release notes:\n${latestRelease.body}`)
        }
        yield* prompter.outro("🆙 Template update available")
      }
    })
  )
)
