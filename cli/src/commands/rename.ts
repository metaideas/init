import { Command, Prompt } from "@effect/cli"
import { Console, Effect } from "effect"
import {
  readPackageJson,
  replaceProjectNameInProjectFiles,
  requireInitProject,
  updatePackageJson,
} from "#utils.ts"

export default Command.make("rename").pipe(
  Command.withDescription("Rename the project and update all @init references"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n✏️  Project Rename\n")

      const newProjectName = yield* Prompt.text({
        message: "Enter your new project name",
        default: "my-app",
      })

      const packageJson = yield* readPackageJson()
      const currentProjectName = packageJson.name

      yield* Console.log("   Updating package.json...\n")
      yield* updatePackageJson(newProjectName)
      yield* Console.log("✅ Package.json updated\n")

      yield* Console.log("   Updating file references...\n")
      yield* replaceProjectNameInProjectFiles(newProjectName, currentProjectName)
      yield* Console.log("✅ References updated\n")

      yield* Console.log("\n🎉 Project rename complete!\n")
    }).pipe(
      Effect.catchTag("PackageJsonParseFailed", (e) =>
        Console.error(`\nFailed to parse package.json: ${e.message}`)
      )
    )
  ),
  Command.provideEffectDiscard(requireInitProject())
)
