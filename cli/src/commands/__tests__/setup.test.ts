import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import setupCommand from "#commands/setup.ts"
import { CommandRunner, type CommandRunOptions } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { internalPaths } from "#lib/shared/internal-paths.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("setupCommand", () => {
  test("sets up a project and removes internal files", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-setup-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"init","version":"2.0.2"}\n')

    await Promise.all(
      internalPaths.map(async (path) => {
        if (path === "cli" || path === ".plans") {
          await mkdir(path, { recursive: true })
          return
        }
        await mkdir(join(path, ".."), { recursive: true })
        await writeFile(path, "internal\n")
      })
    )

    const calls: CommandRunOptions[] = []
    const multiselectResponses = [[], []]
    const prompter: PrompterService = {
      cancel: () => Effect.void,
      confirm: () => Effect.succeed(false),
      intro: () => Effect.void,
      log: {
        error: () => Effect.void,
        info: () => Effect.void,
        success: () => Effect.void,
        warning: () => Effect.void,
      },
      multiselect: () => Effect.succeed(multiselectResponses.shift() ?? []),
      outro: () => Effect.void,
      select: () => Effect.die("Unexpected select prompt"),
      text: () => Effect.succeed("smoke-project"),
    }
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(CommandRunner)({
        run: (options) => {
          calls.push(options)
          return Effect.succeed(ChildProcessSpawner.ExitCode(0))
        },
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(setupCommand, { version: "test" })([]).pipe(Effect.provide(layer))
    )

    const internalPathExists = await Promise.all(
      internalPaths.map((path) => Bun.file(path).exists())
    )
    expect(internalPathExists).toEqual(internalPaths.map(() => false))
    expect(JSON.parse(await readFile("package.json", "utf8"))).toMatchObject({
      name: "smoke-project",
      version: "0.0.1",
    })
    expect(await readFile("README.md", "utf8")).toContain("smoke-project")
    expect(calls.map(({ args, command }) => ({ args, command }))).toEqual([
      { args: ["--version"], command: "git" },
      { args: ["init"], command: "git" },
      { args: ["install"], command: "bun" },
    ])
  })
})
