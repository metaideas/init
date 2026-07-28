import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import createCommand from "#commands/create.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { TemplateDownloader, type DownloadOptions } from "#lib/services/template-downloader.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("createCommand", () => {
  test("forces download after confirming overwrite", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-"))
    process.chdir(temporaryDirectory)
    await mkdir("existing")

    const confirmations = [true, false]
    const downloads: DownloadOptions[] = []
    const intros: string[] = []
    const prompter: PrompterService = {
      cancel: () => Effect.void,
      confirm: () => Effect.succeed(confirmations.shift() ?? false),
      intro: (message) => Effect.sync(() => intros.push(message)).pipe(Effect.asVoid),
      log: {
        error: () => Effect.void,
        info: () => Effect.void,
        success: () => Effect.void,
        warning: () => Effect.void,
      },
      multiselect: () => Effect.succeed([]),
      outro: () => Effect.void,
      select: () => Effect.die("Unexpected select prompt"),
      text: () => Effect.succeed("existing"),
    }
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(TemplateDownloader)({
        download: (options) => Effect.sync(() => downloads.push(options)).pipe(Effect.asVoid),
      }),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(createCommand, { version: "test" })(["existing"]).pipe(Effect.provide(layer))
    )

    expect(downloads).toEqual([
      { directory: "existing", force: true, source: "github:metaideas/init" },
    ])
    expect(intros).toEqual(["▶︎ init"])
  })
})
