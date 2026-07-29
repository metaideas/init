import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { selectProjectDestination } from "#lib/projects/destination.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

function makePrompter(options?: {
  readonly confirm?: boolean
  readonly text?: string
  readonly warnings?: string[]
}): PrompterService {
  return {
    cancel: () => Effect.void,
    confirm: () => Effect.succeed(options?.confirm ?? false),
    intro: () => Effect.void,
    log: {
      error: () => Effect.void,
      info: () => Effect.void,
      success: () => Effect.void,
      warning: (message) =>
        Effect.sync(() => {
          options?.warnings?.push(message)
        }),
    },
    multiselect: () => Effect.succeed([]),
    outro: () => Effect.void,
    select: () => Effect.die("Unexpected select prompt"),
    text: () => Effect.succeed(options?.text ?? "project"),
  }
}

describe("selectProjectDestination", () => {
  test("selects a new directory from the prompt", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-lib-"))
    process.chdir(temporaryDirectory)

    const destination = await Effect.runPromise(
      selectProjectDestination({ yes: false }).pipe(
        Effect.provide(
          Layer.mergeAll(
            BunServices.layer,
            Layer.succeed(Prompter)(makePrompter({ text: " new-project " }))
          )
        )
      )
    )

    expect(destination).toEqual({ directory: "new-project", force: false })
  })

  test("fails when overwriting an existing directory is declined", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-lib-"))
    process.chdir(temporaryDirectory)
    await mkdir("existing")

    const error = await Effect.runPromise(
      Effect.flip(
        selectProjectDestination({ name: "existing", yes: false }).pipe(
          Effect.provide(
            Layer.mergeAll(
              BunServices.layer,
              Layer.succeed(Prompter)(makePrompter({ confirm: false }))
            )
          )
        )
      )
    )

    expect(error._tag).toBe("OperationCancelled")
  })
})
