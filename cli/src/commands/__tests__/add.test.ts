import { afterEach, describe, expect, test } from "bun:test"
import { mkdirSync, writeFileSync } from "node:fs"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import addCommand from "#commands/add.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { TemplateDownloader } from "#lib/services/template-downloader.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

function createCommandLayer(writeTemplate: (directory: string) => void) {
  const prompter: PrompterService = {
    cancel: () => Effect.void,
    confirm: () => Effect.die("Unexpected confirm prompt"),
    intro: () => Effect.void,
    log: {
      error: () => Effect.void,
      info: () => Effect.void,
      success: () => Effect.void,
      warning: () => Effect.void,
    },
    multiselect: () => Effect.die("Unexpected multiselect prompt"),
    outro: () => Effect.void,
    select: () => Effect.die("Unexpected select prompt"),
    text: () => Effect.die("Unexpected text prompt"),
  }

  return Layer.mergeAll(
    BunServices.layer,
    Layer.succeed(Prompter)(prompter),
    Layer.succeed(TemplateDownloader)({
      download: ({ directory }) =>
        Effect.sync(() => {
          writeTemplate(directory)
        }),
    }),
    Layer.succeed(CommandRunner)({
      run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
      string: () => Effect.succeed(""),
    })
  )
}

describe("add", () => {
  test("adds an app and its required workspaces", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-add-app-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"demo"}\n')

    const layer = createCommandLayer((directory) => {
      mkdirSync(join(directory, "apps/source"), { recursive: true })
      mkdirSync(join(directory, "packages/auth"), { recursive: true })
      writeFileSync(
        join(directory, "manifest.json"),
        JSON.stringify({
          cleanupPaths: [],
          excludedPaths: [],
          workspaces: [
            {
              description: "Source",
              dir: "apps/source",
              id: "source",
              name: "source",
              relationships: [
                {
                  dependencySection: "dependencies",
                  kind: "required",
                  target: "auth",
                },
              ],
              type: "app",
            },
            {
              description: "Auth",
              dir: "packages/auth",
              id: "auth",
              name: "@init/auth",
              relationships: [],
              type: "package",
            },
          ],
        })
      )
      writeFileSync(
        join(directory, "apps/source/package.json"),
        JSON.stringify({
          dependencies: { "@init/auth": "workspace:*" },
          name: "source",
        })
      )
      writeFileSync(
        join(directory, "packages/auth/package.json"),
        JSON.stringify({ name: "@init/auth" })
      )
    })

    await Effect.runPromise(
      Command.runWith(addCommand, { version: "test" })([
        "app",
        "--workspace",
        "source",
        "--destination",
        "dashboard",
        "--yes",
        "--no-install",
      ]).pipe(Effect.provide(layer))
    )

    expect(JSON.parse(await readFile("apps/dashboard/package.json", "utf8"))).toEqual({
      dependencies: { "@demo/auth": "workspace:*" },
      name: "dashboard",
    })
    expect(JSON.parse(await readFile("packages/auth/package.json", "utf8"))).toEqual({
      name: "@demo/auth",
    })
  })

  test("adds a package and removes omitted recommendations", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-add-workspace-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"demo"}\n')

    const layer = createCommandLayer((directory) => {
      mkdirSync(join(directory, "packages/source"), { recursive: true })
      writeFileSync(
        join(directory, "manifest.json"),
        JSON.stringify({
          cleanupPaths: [],
          excludedPaths: [],
          workspaces: [
            {
              description: "Source",
              dir: "packages/source",
              id: "source",
              name: "@init/source",
              relationships: [
                {
                  dependencySection: "dependencies",
                  kind: "recommended",
                  reason: "Only needed for remote calls.",
                  target: "api",
                },
              ],
              type: "package",
            },
            {
              description: "API",
              dir: "apps/api",
              id: "api",
              name: "api",
              relationships: [],
              type: "app",
            },
          ],
        })
      )
      writeFileSync(
        join(directory, "packages/source/package.json"),
        JSON.stringify({
          dependencies: {
            api: "workspace:*",
            react: "19.1.0",
          },
          name: "@init/source",
        })
      )
    })

    await Effect.runPromise(
      Command.runWith(addCommand, { version: "test" })([
        "package",
        "--workspace",
        "source",
        "--destination",
        "copied",
        "--yes",
        "--no-install",
      ]).pipe(Effect.provide(layer))
    )

    expect(JSON.parse(await readFile("packages/copied/package.json", "utf8"))).toEqual({
      dependencies: { react: "19.1.0" },
      name: "@demo/copied",
    })
  })
})
