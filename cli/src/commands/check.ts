import { Command } from "@effect/cli"
import { Console, Effect } from "effect"
import {
  compareVersions,
  getLatestRelease,
  getVersion,
  requireInitProject,
  VersionCheckFailed,
} from "#utils.ts"

export default Command.make("check").pipe(
  Command.withDescription("Check template version"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n🔍 Template Version Check\n")

      yield* Console.log("   Checking for template updates...\n")

      const [currentVersion, latestRelease] = yield* Effect.all(
        [getVersion(), getLatestRelease()],
        { concurrency: 2 }
      )

      const latestVersion = latestRelease.tagName

      yield* Console.log(`   Current: ${currentVersion ?? "Unknown"}`)
      yield* Console.log(`   Latest:  ${latestVersion}\n`)

      if (!currentVersion) {
        yield* Console.log(
          "⚠️  No local template version found. Run 'init-now update' to initialize.\n"
        )
        return
      }

      const comparison = yield* compareVersions(currentVersion, latestVersion)

      if (comparison === 0) {
        yield* Console.log("✅ Template is up to date!\n")
      } else if (comparison > 0) {
        yield* Console.log(
          `⚠️  Local version (${currentVersion}) is newer than latest release (${latestVersion})\n`
        )
      } else {
        yield* Console.log(`🆙 Update available: ${currentVersion} → ${latestVersion}\n`)
        yield* Console.log("   Run 'init-now update' to update your template\n")

        if (latestRelease.body) {
          yield* Console.log("   Release notes:\n")
          yield* Console.log(`${latestRelease.body}\n`)
        }
      }
    }).pipe(
      Effect.catchTag("VersionCheckFailed", (e) =>
        Console.error(`\n✖  Failed to check for updates: ${e.message}\n`)
      )
    )
  ),
  Command.provideEffectDiscard(requireInitProject())
)
