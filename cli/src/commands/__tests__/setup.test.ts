import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import setupCommand from "#commands/setup.ts"
import { CommandRunner, type CommandRunOptions } from "#lib/services/command-runner.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { selectWorkspaceConfiguration } from "#lib/workspaces/configuration.ts"

const originalWorkingDirectory = process.cwd()
const internalPaths = ["cli", ".plans", "manifest.json"]
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("setupCommand", () => {
  test("uses workspace flags only before returning to selection", async () => {
    const manifest: TemplateManifest = {
      cleanupPaths: [],
      excludedPaths: [],
      workspaces: [
        {
          description: "App",
          dir: "apps/app",
          id: "app",
          name: "app",
          relationships: [
            {
              kind: "recommended",
              reason: "Optional API.",
              target: "api",
            },
          ],
          type: "app",
        },
        {
          description: "API",
          dir: "apps/api",
          id: "api",
          name: "api",
          relationships: [],
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
    }
    const selections: Array<{ initialValues: readonly string[] | undefined; message: string }> = []
    let selectCount = 0
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
      multiselect: (options) => {
        selections.push({
          initialValues: options.initialValues?.map(String),
          message: options.message,
        })
        if (!options.message.startsWith("Select apps")) return Effect.succeed([])
        const option = options.options.at(0)
        return option ? Effect.succeed([option.value]) : Effect.die("Missing app option")
      },
      outro: () => Effect.void,
      select: (options) => {
        const option = options.options.at(selectCount)
        selectCount += 1
        return option ? Effect.succeed(option.value) : Effect.die("Missing selection option")
      },
      text: () => Effect.die("Unexpected text prompt"),
    }

    await Effect.runPromise(
      selectWorkspaceConfiguration(manifest, {
        apps: ["app"],
        name: "demo",
        packages: ["auth"],
        yes: false,
      }).pipe(Effect.provide(Layer.succeed(Prompter)(prompter)))
    )

    expect(selections).toEqual([
      {
        initialValues: ["app"],
        message: "Select apps to keep (all others will be removed)",
      },
      {
        initialValues: ["auth"],
        message:
          "Select packages to keep. Packages required by selected apps are retained automatically.",
      },
    ])
  })

  test("sets up a project and removes internal files", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-setup-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile(
      "package.json",
      '{"name":"init","version":"2.0.2","scripts":{"generate:manifest":"dead","test":"bun test"},"init":{"cleanupPaths":[]}}\n'
    )
    await writeFile(
      "manifest.json",
      JSON.stringify({
        cleanupPaths: internalPaths,
        excludedPaths: [".git", "node_modules"],
        workspaces: [],
      })
    )

    await Promise.all(
      internalPaths.map(async (path) => {
        if (path === "manifest.json") return
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
      scripts: { test: "bun test" },
      version: "0.0.1",
    })
    expect(await readFile("package.json", "utf8")).not.toContain("generate:manifest")
    expect(await readFile("package.json", "utf8")).not.toContain('"init"')
    expect(await readFile("README.md", "utf8")).toContain("smoke-project")
    expect(calls.map(({ args, command }) => ({ args, command }))).toEqual([
      { args: ["--version"], command: "git" },
      { args: ["--version"], command: "bun" },
      { args: ["init"], command: "git" },
      { args: ["install"], command: "bun" },
    ])
  })

  test("supports a prompt-free app-only setup and reports removals", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-setup-flags-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"init","version":"2.0.2"}\n')
    await Promise.all([
      mkdir("apps/app/src", { recursive: true }),
      mkdir("apps/api", { recursive: true }),
      mkdir(".git", { recursive: true }),
      mkdir("node_modules", { recursive: true }),
      mkdir("packages/auth", { recursive: true }),
      mkdir("packages/backend", { recursive: true }),
    ])
    await Promise.all([
      writeFile(
        "apps/app/package.json",
        '{"name":"app","dependencies":{"@init/auth":"workspace:*","api":"workspace:*"}}\n'
      ),
      writeFile("apps/api/package.json", '{"name":"api"}\n'),
      writeFile("packages/auth/package.json", '{"name":"@init/auth"}\n'),
      writeFile("packages/backend/package.json", '{"name":"@init/backend"}\n'),
      writeFile("apps/app/src/client.ts", 'import { client } from "api"\n'),
      writeFile(".git/HEAD", "ref: refs/heads/main\n"),
      writeFile("node_modules/marker", "installed\n"),
    ])
    await writeFile(
      "manifest.json",
      JSON.stringify({
        cleanupPaths: ["manifest.json"],
        excludedPaths: [".git", "node_modules"],
        workspaces: [
          {
            description: "App",
            dir: "apps/app",
            id: "app",
            name: "app",
            relationships: [
              {
                dependencySection: "dependencies",
                kind: "required",
                target: "auth",
              },
              {
                dependencySection: "dependencies",
                kind: "recommended",
                reason: "Only needed for remote calls.",
                target: "api",
              },
            ],
            type: "app",
          },
          {
            description: "API",
            dir: "apps/api",
            id: "api",
            name: "api",
            relationships: [],
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
          {
            description: "Backend",
            dir: "packages/backend",
            id: "backend",
            name: "@init/backend",
            relationships: [],
            type: "package",
          },
        ],
      })
    )

    const infoMessages: string[] = []
    const warningMessages: string[] = []
    const prompter: PrompterService = {
      cancel: () => Effect.void,
      confirm: () => Effect.die("Unexpected confirm prompt"),
      intro: () => Effect.void,
      log: {
        error: () => Effect.void,
        info: (message) =>
          Effect.sync(() => {
            infoMessages.push(message)
          }),
        success: () => Effect.void,
        warning: (message) =>
          Effect.sync(() => {
            warningMessages.push(message)
          }),
      },
      multiselect: () => Effect.die("Unexpected multiselect prompt"),
      outro: () => Effect.void,
      select: () => Effect.die("Unexpected select prompt"),
      text: () => Effect.die("Unexpected text prompt"),
    }
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(setupCommand, { version: "test" })([
        "--yes",
        "--apps",
        "app",
        "--name",
        "demo",
        "--no-install",
        "--no-git",
      ]).pipe(Effect.provide(layer))
    )

    expect(await Bun.file("apps/app/package.json").exists()).toBe(true)
    expect(JSON.parse(await readFile("apps/app/package.json", "utf8")).dependencies).toEqual({
      "@demo/auth": "workspace:*",
    })
    expect(await Bun.file("packages/auth/package.json").exists()).toBe(true)
    expect(await Bun.file("apps/api/package.json").exists()).toBe(false)
    expect(await Bun.file("packages/backend/package.json").exists()).toBe(false)
    expect(await Bun.file(".git/HEAD").text()).toContain("refs/heads/main")
    expect(await Bun.file("node_modules/marker").text()).toBe("installed\n")
    expect(infoMessages).toContain("The following workspaces will be removed: api, backend")
    expect(warningMessages).toContain(
      "References to omitted recommendations remain:\napps/app/src/client.ts references removed workspace api"
    )
  })

  test("keeps every workspace for a bare --yes setup", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-setup-defaults-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"init","version":"2.0.2"}\n')
    await Promise.all([
      mkdir("apps/app", { recursive: true }),
      mkdir("apps/api", { recursive: true }),
      mkdir("packages/auth", { recursive: true }),
      mkdir("packages/backend", { recursive: true }),
    ])
    await Promise.all([
      writeFile("apps/app/package.json", '{"name":"app"}\n'),
      writeFile("apps/api/package.json", '{"name":"api"}\n'),
      writeFile("packages/auth/package.json", '{"name":"@init/auth"}\n'),
      writeFile("packages/backend/package.json", '{"name":"@init/backend"}\n'),
      writeFile(
        "manifest.json",
        JSON.stringify({
          cleanupPaths: ["manifest.json"],
          excludedPaths: [".git", "node_modules"],
          workspaces: [
            {
              description: "App",
              dir: "apps/app",
              id: "app",
              name: "app",
              relationships: [],
              type: "app",
            },
            {
              description: "API",
              dir: "apps/api",
              id: "api",
              name: "api",
              relationships: [],
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
            {
              description: "Backend",
              dir: "packages/backend",
              id: "backend",
              name: "@init/backend",
              relationships: [],
              type: "package",
            },
          ],
        })
      ),
    ])

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
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )

    await Effect.runPromise(
      Command.runWith(setupCommand, { version: "test" })([
        "--yes",
        "--name",
        "demo",
        "--no-install",
        "--no-git",
      ]).pipe(Effect.provide(layer))
    )

    expect(
      await Promise.all([
        Bun.file("apps/app/package.json").exists(),
        Bun.file("apps/api/package.json").exists(),
        Bun.file("packages/auth/package.json").exists(),
        Bun.file("packages/backend/package.json").exists(),
      ])
    ).toEqual([true, true, true, true])
  })

  test("fails when an omitted workspace has an undeclared reference", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-setup-dangling-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.2"}\n')
    await writeFile("package.json", '{"name":"init","version":"2.0.2"}\n')
    await Promise.all([
      mkdir("apps/app/src", { recursive: true }),
      mkdir("apps/api", { recursive: true }),
    ])
    await Promise.all([
      writeFile("apps/app/package.json", '{"name":"app"}\n'),
      writeFile("apps/app/src/client.ts", 'import { client } from "api"\n'),
      writeFile("apps/api/package.json", '{"name":"api"}\n'),
      writeFile(
        "manifest.json",
        JSON.stringify({
          cleanupPaths: ["manifest.json"],
          excludedPaths: [".git", "node_modules"],
          workspaces: [
            {
              description: "App",
              dir: "apps/app",
              id: "app",
              name: "app",
              relationships: [],
              type: "app",
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
      ),
    ])

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
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(Prompter)(prompter),
      Layer.succeed(CommandRunner)({
        run: () => Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        string: () => Effect.succeed(""),
      })
    )
    const error = await Effect.runPromise(
      Effect.flip(
        Command.runWith(setupCommand, { version: "test" })([
          "--yes",
          "--apps",
          "app",
          "--name",
          "demo",
          "--no-install",
          "--no-git",
        ])
      ).pipe(Effect.provide(layer))
    )

    expect(error).toMatchObject({
      _tag: "InvalidWorkspaceSelection",
      message:
        "Dangling workspace references remain:\napps/app/src/client.ts references removed workspace api",
    })
  })
})
