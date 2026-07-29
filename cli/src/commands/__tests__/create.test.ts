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
import { VersionCheckFailed } from "#lib/core/errors.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { TemplateDownloader, type DownloadOptions } from "#lib/services/template-downloader.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

function makePrompter(options?: {
  readonly confirmations?: boolean[]
  readonly errors?: string[]
  readonly warnings?: string[]
}): PrompterService {
  return {
    cancel: () => Effect.void,
    confirm: () => Effect.succeed(options?.confirmations?.shift() ?? false),
    intro: () => Effect.void,
    log: {
      error: (message) => Effect.sync(() => options?.errors?.push(message)).pipe(Effect.asVoid),
      info: () => Effect.void,
      success: () => Effect.void,
      warning: (message) => Effect.sync(() => options?.warnings?.push(message)).pipe(Effect.asVoid),
    },
    multiselect: () => Effect.succeed([]),
    outro: () => Effect.void,
    select: () => Effect.die("Unexpected select prompt"),
    text: () => Effect.die("Unexpected text prompt"),
  }
}

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
      text: () => Effect.die("Unexpected text prompt"),
    }
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(TemplateDownloader)({
        download: (options) => Effect.sync(() => downloads.push(options)).pipe(Effect.asVoid),
      }),
      Layer.succeed(ReleaseClient)({
        getLatest: () =>
          Effect.succeed({
            body: "",
            name: "2.0.2",
            publishedAt: "2026-07-29",
            tagName: "init@v2.0.2",
          }),
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
      {
        directory: "existing",
        force: true,
        source: "github:metaideas/init#init@v2.0.2",
      },
    ])
    expect(intros).toEqual(["▶︎ init"])
  })

  test("uses an explicit ref without looking up a release", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-"))
    process.chdir(temporaryDirectory)

    const downloads: DownloadOptions[] = []
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(makePrompter()),
      Layer.succeed(TemplateDownloader)({
        download: (options) => Effect.sync(() => downloads.push(options)).pipe(Effect.asVoid),
      }),
      Layer.succeed(ReleaseClient)({
        getLatest: () => Effect.die("Release lookup should not be called"),
      }),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(createCommand, { version: "test" })(["--ref", "next", "project"]).pipe(
        Effect.provide(layer)
      )
    )

    expect(downloads).toEqual([
      { directory: "project", force: false, source: "github:metaideas/init#next" },
    ])
  })

  test("falls back to main when the release lookup fails", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-"))
    process.chdir(temporaryDirectory)

    const downloads: DownloadOptions[] = []
    const warnings: string[] = []
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(makePrompter({ warnings })),
      Layer.succeed(TemplateDownloader)({
        download: (options) => Effect.sync(() => downloads.push(options)).pipe(Effect.asVoid),
      }),
      Layer.succeed(ReleaseClient)({
        getLatest: () => Effect.fail(new VersionCheckFailed({ cause: new Error("offline") })),
      }),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(createCommand, { version: "test" })(["project"]).pipe(Effect.provide(layer))
    )

    expect(downloads).toEqual([
      { directory: "project", force: false, source: "github:metaideas/init#main" },
    ])
    expect(warnings).toContain(
      "Could not resolve the latest release (offline). Falling back to main."
    )
  })

  test("fails instead of overwriting an existing directory with --yes", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-create-"))
    process.chdir(temporaryDirectory)
    await mkdir("existing")

    const downloads: DownloadOptions[] = []
    const errors: string[] = []
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(makePrompter({ errors })),
      Layer.succeed(TemplateDownloader)({
        download: (options) => Effect.sync(() => downloads.push(options)).pipe(Effect.asVoid),
      }),
      Layer.succeed(ReleaseClient)({
        getLatest: () => Effect.die("Release lookup should not be called"),
      }),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    const error = await Effect.runPromise(
      Effect.flip(
        Command.runWith(createCommand, { version: "test" })(["--yes", "existing"]).pipe(
          Effect.provide(layer)
        )
      )
    )

    expect(error._tag).toBe("OperationCancelled")
    expect(downloads).toEqual([])
    expect(errors).toEqual([
      'Directory "existing" already exists. Remove it or choose a different name.',
    ])
  })
})
