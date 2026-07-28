import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { Prompter } from "#lib/services/prompter.ts"
import {
  getProjectNameValidationError,
  normalizeProjectName,
  readPackageJson,
  replaceProjectNameInProjectFiles,
  updatePackageJson,
} from "#lib/shared/project.ts"
import { requireInitProject } from "#lib/shared/releases.ts"

export default Command.make("rename").pipe(
  Command.withDescription("Rename the project and update all @init references"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      const prompter = yield* Prompter

      yield* prompter.intro("✏️  Project Rename")
      const newProjectName = normalizeProjectName(
        yield* prompter.text({
          defaultValue: "my-app",
          message: "Enter your new project name",
          validate: getProjectNameValidationError,
        })
      )
      const packageJson = yield* readPackageJson()

      yield* prompter.log.info("Updating package.json...")
      yield* updatePackageJson(newProjectName)
      yield* prompter.log.success("Package.json updated")

      yield* prompter.log.info("Updating file references...")
      yield* replaceProjectNameInProjectFiles(newProjectName, packageJson.name)
      yield* prompter.log.success("References updated")
      yield* prompter.outro("🎉 Project rename complete!")
    })
  )
)
