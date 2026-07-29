import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { pruneWorkspaces } from "#lib/workspaces/pruning.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

const manifest: TemplateManifest = {
  cleanupPaths: ["manifest.json"],
  excludedPaths: [".git", "node_modules"],
  workspaces: [
    {
      description: "App",
      dir: "apps/app",
      id: "app",
      name: "app",
      relationships: [
        { kind: "required", target: "auth" },
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
  ],
}

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
  temporaryDirectory = undefined
})

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

describe("pruneWorkspaces", () => {
  test("removes unselected workspaces and omitted dependencies", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-prune-workspaces-"))
    process.chdir(temporaryDirectory)
    await Promise.all([
      mkdir("apps/app", { recursive: true }),
      mkdir("apps/api", { recursive: true }),
      mkdir("packages/auth", { recursive: true }),
      mkdir("turbo/generators/templates", { recursive: true }),
    ])
    await Promise.all([
      writeFile("package.json", '{"name":"init"}\n'),
      writeFile(
        "apps/app/package.json",
        '{"name":"app","dependencies":{"api":"workspace:*","@init/auth":"workspace:*"}}\n'
      ),
      writeFile("apps/api/package.json", '{"name":"api"}\n'),
      writeFile("packages/auth/package.json", '{"name":"@init/auth"}\n'),
      writeFile("turbo/generators/templates/api.ts.hbs", 'import type { Api } from "api/client"\n'),
    ])

    const paths = await Effect.runPromise(
      pruneWorkspaces(manifest, {
        projectName: "demo",
        selected: new Set(["app", "auth"]),
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, createPrompterLayer())))
    )

    expect(paths).toEqual(["apps/app", "packages/auth"])
    expect(await Bun.file("apps/api/package.json").exists()).toBe(false)
    expect(JSON.parse(await readFile("apps/app/package.json", "utf8"))).toEqual({
      dependencies: { "@init/auth": "workspace:*" },
      name: "app",
    })
  })
})
