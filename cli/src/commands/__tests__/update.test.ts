import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import updateCommand from "#commands/update.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("updateCommand", () => {
  test("exits when the template is already current", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-update-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')

    const messages: string[] = []
    const commands: string[] = []
    const prompter: PrompterService = {
      cancel: () => Effect.void,
      confirm: () => Effect.succeed(false),
      intro: () => Effect.void,
      log: {
        error: (message) => Effect.sync(() => messages.push(message)).pipe(Effect.asVoid),
        info: (message) => Effect.sync(() => messages.push(message)).pipe(Effect.asVoid),
        success: (message) => Effect.sync(() => messages.push(message)).pipe(Effect.asVoid),
        warning: (message) => Effect.sync(() => messages.push(message)).pipe(Effect.asVoid),
      },
      multiselect: () => Effect.succeed([]),
      outro: (message) => Effect.sync(() => messages.push(message)).pipe(Effect.asVoid),
      select: () => Effect.die("Unexpected select prompt"),
      text: () => Effect.die("Unexpected text prompt"),
    }
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(ReleaseClient)({
        getLatest: () =>
          Effect.succeed({
            body: "",
            name: "init 2.0.2",
            publishedAt: "2026-07-28T00:00:00Z",
            tagName: "init@v2.0.2",
          }),
      }),
      Layer.succeed(CommandRunner)({
        run: ({ command }) => {
          commands.push(command)
          return Effect.succeed(ChildProcessSpawner.ExitCode(0))
        },
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(updateCommand, { version: "test" })([]).pipe(Effect.provide(layer))
    )

    expect(messages).toContain("Already up to date (2.0.2)")
    expect(messages).toContain("✅ Template is already up to date.")
    expect(commands).toEqual(["git"])
  })
})
