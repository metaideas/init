import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import checkCommand from "#commands/check.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("checkCommand", () => {
  test("checks the scaffolded project version", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-check-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')

    const messages: string[] = []
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
      })
    )

    await Effect.runPromise(
      Command.runWith(checkCommand, { version: "test" })([]).pipe(Effect.provide(layer))
    )

    expect(messages).toContain("Current: 2.0.2")
    expect(messages).toContain("Latest: init@v2.0.2")
    expect(messages).toContain("✅ Template is up to date!")
  })
})
