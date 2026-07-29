import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import { configureProject, initializeGitRepository } from "#lib/projects/configuration.ts"
import { CommandRunner, type CommandRunOptions } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

const manifest: TemplateManifest = {
  cleanupPaths: ["manifest.json"],
  excludedPaths: [".git", "node_modules"],
  workspaces: [],
}

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
  temporaryDirectory = undefined
})

async function useTemporaryWorkspace(prefix: string) {
  temporaryDirectory = await mkdtemp(join(tmpdir(), prefix))
  process.chdir(temporaryDirectory)
}

function createPrompterLayer() {
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
  return Layer.succeed(Prompter)(prompter)
}

describe("configureProject", () => {
  test("finalizes project metadata, environment files, and internal cleanup", async () => {
    await useTemporaryWorkspace("init-configure-project-")
    await mkdir("apps/app", { recursive: true })
    await writeFile(
      "package.json",
      '{"name":"init","version":"2.0.2","scripts":{"generate:manifest":"dead","test":"bun test"},"init":{}}\n'
    )
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("manifest.json", "{}\n")
    await writeFile("knip.config.ts", '  ignore: ["cli/**"],\n')
    await writeFile("oxfmt.config.ts", '    "cli/**",\n')
    await writeFile(
      "oxlint.config.ts",
      "    // The standalone CLI runs its own Adamantite checks outside the root workspace.\n" +
        '    "cli/**",\n'
    )
    await writeFile("apps/app/.env.template", "APP_NAME=@init/app\n")
    await writeFile(
      "apps/app/package.json",
      '{"name":"app","dependencies":{"@init/auth":"workspace:*"}}\n'
    )

    await Effect.runPromise(
      configureProject({
        manifest,
        projectName: "demo",
        selectedWorkspacePaths: ["apps/app"],
        templateVersion: "2.0.2",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, createPrompterLayer())))
    )

    expect(JSON.parse(await readFile("package.json", "utf8"))).toEqual({
      name: "demo",
      scripts: { test: "bun test" },
      version: "0.0.1",
    })
    expect(await readFile("apps/app/.env.local", "utf8")).toBe("APP_NAME=@init/app\n")
    expect(await readFile("README.md", "utf8")).toContain("demo")
    expect(await Bun.file("manifest.json").exists()).toBe(false)
    expect(await readFile("knip.config.ts", "utf8")).not.toContain("cli/**")
    expect(await readFile("oxfmt.config.ts", "utf8")).not.toContain("cli/**")
    expect(await readFile("oxlint.config.ts", "utf8")).not.toContain("cli/**")
  })
})

describe("initializeGitRepository", () => {
  test("initializes Git when the repository does not exist", async () => {
    await useTemporaryWorkspace("init-git-project-")
    const calls: CommandRunOptions[] = []
    const layer = Layer.merge(
      BunServices.layer,
      Layer.succeed(CommandRunner)({
        run: (options) => {
          calls.push(options)
          return Effect.succeed(ChildProcessSpawner.ExitCode(0))
        },
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(initializeGitRepository().pipe(Effect.provide(layer)))

    expect(calls).toEqual([{ args: ["init"], command: "git" }])
  })
})
