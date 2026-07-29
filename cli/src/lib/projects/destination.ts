import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { OperationCancelled } from "#lib/core/errors.ts"
import { getProjectNameValidationError } from "#lib/projects/files.ts"
import { Prompter } from "#lib/services/prompter.ts"

export const selectProjectDestination = Effect.fn("selectProjectDestination")(function* (options: {
  readonly name?: string
  readonly yes: boolean
}) {
  const fs = yield* FileSystem.FileSystem
  const prompter = yield* Prompter
  const projectName = (
    options.name ??
    (yield* prompter.text({
      message: "What is the name of your project?",
      validate: getProjectNameValidationError,
    }))
  ).trim()
  const directoryExists = yield* fs.stat(projectName).pipe(
    Effect.map((info) => info.type === "Directory"),
    Effect.catch(() => Effect.succeed(false))
  )

  if (!directoryExists) return { directory: projectName, force: false }

  const shouldOverwrite =
    options.yes ||
    (yield* prompter.confirm({
      initialValue: false,
      message: `Directory "${projectName}" already exists. Do you want to overwrite it?`,
    }))
  if (!shouldOverwrite) return yield* Effect.fail(new OperationCancelled())

  return { directory: projectName, force: true }
})
