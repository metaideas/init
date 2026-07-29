import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import {
  selectWorkspaceConfiguration,
  validateWorkspaceFlags,
} from "#lib/workspaces/configuration.ts"

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
      relationships: [{ kind: "required", target: "auth" }],
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

describe("validateWorkspaceFlags", () => {
  test("parses valid flags and rejects unknown workspace ids", async () => {
    const flags = await Effect.runPromise(
      validateWorkspaceFlags(manifest, {
        apps: "app",
        packages: "auth",
      })
    )
    const error = await Effect.runPromise(
      Effect.flip(
        validateWorkspaceFlags(manifest, {
          apps: "missing",
        })
      )
    )

    expect(flags).toEqual({ apps: ["app"], packages: ["auth"] })
    expect(error._tag).toBe("InvalidWorkspaceSelection")
    expect(error.message).toBe("Unknown app: missing")
  })
})

describe("selectWorkspaceConfiguration", () => {
  test("normalizes the project name and retains required packages", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-select-configuration-"))
    process.chdir(temporaryDirectory)

    const configuration = await Effect.runPromise(
      selectWorkspaceConfiguration(manifest, {
        apps: ["app"],
        name: " demo ",
        yes: true,
      }).pipe(Effect.provide(createPrompterLayer()))
    )

    expect(configuration.projectName).toBe("demo")
    expect(configuration.selected).toEqual(new Set(["app", "auth"]))
  })
})
