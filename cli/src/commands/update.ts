import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { requireTool } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }
import { getCompatibilityWarning, getSnapshotVersion } from "#lib/templates/compatibility.ts"
import {
  acquireTemplateDirectory,
  analyzeTemplateUpdate,
  applyTemplateUpdate,
  getTemplateUpdate,
  verifyCleanWorkingTree,
} from "#lib/templates/synchronization.ts"
import { requireInitProject } from "#lib/templates/versions.ts"

export default Command.make("update").pipe(
  Command.withDescription("Sync with template updates"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      yield* requireTool("git")
      const prompter = yield* Prompter

      yield* prompter.intro("🔄 Template Synchronization")
      yield* prompter.log.info("Checking for template updates...")
      const { shouldExit, latestRelease, message, warning } = yield* getTemplateUpdate()

      if (message) yield* prompter.log.info(message)
      if (warning) yield* prompter.log.warning(warning)
      if (shouldExit) {
        yield* prompter.outro("✅ Template is already up to date.")
        return
      }

      yield* prompter.log.info("Checking for uncommitted changes...")
      yield* verifyCleanWorkingTree()
      yield* prompter.log.success("Working directory clean")

      yield* prompter.log.info("Setting up temporary directory...")
      const temporaryDirectory = yield* acquireTemplateDirectory()
      yield* prompter.log.success("Temporary directory created")

      yield* prompter.log.info("Cloning template repository...")
      const filesToCopy = yield* analyzeTemplateUpdate(temporaryDirectory)
      const templateVersion = yield* getSnapshotVersion(temporaryDirectory)
      if (templateVersion) {
        const compatibilityWarning = getCompatibilityWarning(getPackageVersion(), templateVersion)
        if (compatibilityWarning) yield* prompter.log.warning(compatibilityWarning)
      }
      yield* prompter.log.success("Template repository cloned")

      if (filesToCopy.length === 0) {
        yield* prompter.log.success("No file updates to apply")
      }

      yield* prompter.log.info("Applying template changes...")
      yield* applyTemplateUpdate(temporaryDirectory, filesToCopy, latestRelease)
      yield* prompter.log.success("Template changes applied and staged")
      yield* prompter.log.info("Please review the changes and commit them to your repository.")
      yield* prompter.outro("🎉 Template sync completed successfully!")
    }).pipe(Effect.scoped)
  )
)
