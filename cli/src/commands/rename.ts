import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import {
  getProjectNameValidationError,
  readPackageJson,
  replaceProjectNameInProjectFiles,
  updatePackageJson,
} from "#lib/projects/files.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { requireInitProject } from "#lib/templates/versions.ts"

export default Command.make("rename").pipe(
  Command.withDescription("Rename the project and update all @init references"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      const prompter = yield* Prompter

      yield* prompter.intro("✏️  Project Rename")
      const newProjectName = (yield* prompter.text({
        defaultValue: "my-app",
        message: "Enter your new project name",
        validate: getProjectNameValidationError,
      })).trim()
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
