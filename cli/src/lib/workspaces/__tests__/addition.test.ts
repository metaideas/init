import { afterEach, describe, expect, test } from "bun:test"
import { existsSync, mkdirSync } from "node:fs"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { ManifestWorkspace, TemplateManifest } from "#lib/templates/manifest.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import {
  confirmWorkspaceAddition,
  selectWorkspaceAddition,
  writeWorkspaceAddition,
} from "#lib/workspaces/addition.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

const appWorkspace: ManifestWorkspace = {
  description: "App",
  dir: "apps/app",
  id: "app",
  name: "app",
  relationships: [
    {
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
}

const apiWorkspace: ManifestWorkspace = {
  description: "API",
  dir: "apps/api",
  id: "api",
  name: "api",
  relationships: [],
  type: "app",
}

const authWorkspace: ManifestWorkspace = {
  description: "Auth",
  dir: "packages/auth",
  id: "auth",
  name: "@init/auth",
  relationships: [],
  type: "package",
}

const appManifest: TemplateManifest = {
  cleanupPaths: [],
  excludedPaths: [],
  workspaces: [appWorkspace, apiWorkspace, authWorkspace],
}

const sourceWorkspace: ManifestWorkspace = {
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
}

const packageManifest: TemplateManifest = {
  cleanupPaths: [],
  excludedPaths: [],
  workspaces: [sourceWorkspace, apiWorkspace],
}

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

async function useTemporaryWorkspace(prefix: string) {
  temporaryDirectory = await mkdtemp(join(tmpdir(), prefix))
  process.chdir(temporaryDirectory)
  return temporaryDirectory
}

function createPrompterTestContext(options?: {
  readonly confirm?: boolean
  readonly text?: string
}) {
  const logs: Array<{ readonly level: "info" | "warning"; readonly message: string }> = []
  const prompter: PrompterService = {
    cancel: () => Effect.void,
    confirm: () => Effect.succeed(options?.confirm ?? true),
    intro: () => Effect.void,
    log: {
      error: () => Effect.void,
      info: (message) =>
        Effect.sync(() => logs.push({ level: "info", message })).pipe(Effect.asVoid),
      success: () => Effect.void,
      warning: (message) =>
        Effect.sync(() => logs.push({ level: "warning", message })).pipe(Effect.asVoid),
    },
    multiselect: () => Effect.die("Unexpected multiselect prompt"),
    outro: () => Effect.void,
    select: () => Effect.die("Unexpected select prompt"),
    text: () => Effect.succeed(options?.text ?? "workspace"),
  }

  return {
    layer: Layer.succeed(Prompter)(prompter),
    logs,
  }
}

describe("selectWorkspaceAddition", () => {
  test("resolves required workspaces and recommendations", async () => {
    await useTemporaryWorkspace("init-select-workspace-")
    const prompter = createPrompterTestContext()

    const plan = await Effect.runPromise(
      selectWorkspaceAddition(appManifest, {
        type: "app",
        workspace: "app",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )

    expect(plan.requestedWorkspace).toEqual(appWorkspace)
    expect(plan.requiredWorkspaces).toEqual([authWorkspace])
    expect(plan.workspaces).toEqual([appWorkspace, authWorkspace])
    expect(plan.recommendations).toHaveLength(1)
  })

  test("does not plan required workspaces that already exist", async () => {
    await useTemporaryWorkspace("init-select-existing-workspace-")
    await mkdir("packages/auth", { recursive: true })
    const prompter = createPrompterTestContext()

    const plan = await Effect.runPromise(
      selectWorkspaceAddition(appManifest, {
        type: "app",
        workspace: "app",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )

    expect(plan.requiredWorkspaces).toEqual([])
    expect(plan.workspaces).toEqual([appWorkspace])
  })

  test("only reports recommendations sourced by workspaces being added", async () => {
    await useTemporaryWorkspace("init-select-workspace-recommendations-")
    await mkdir("packages/existing", { recursive: true })
    const prompter = createPrompterTestContext()
    const manifest: TemplateManifest = {
      cleanupPaths: [],
      excludedPaths: [],
      workspaces: [
        sourceWorkspace,
        {
          ...sourceWorkspace,
          dir: "packages/existing",
          id: "existing",
          name: "@init/existing",
        },
        apiWorkspace,
      ],
    }

    const plan = await Effect.runPromise(
      selectWorkspaceAddition(manifest, {
        type: "package",
        workspace: "source",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )

    expect(plan.recommendations).toEqual([
      {
        dependencySection: "dependencies",
        reason: "Only needed for remote calls.",
        source: "source",
        target: "api",
      },
    ])
  })

  test("fails when the requested workspace does not exist", async () => {
    await useTemporaryWorkspace("init-select-missing-workspace-")
    const prompter = createPrompterTestContext()

    const error = await Effect.runPromise(
      Effect.flip(
        selectWorkspaceAddition(appManifest, {
          type: "app",
          workspace: "missing",
        }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
      )
    )

    expect(error._tag).toBe("InvalidWorkspaceSelection")
    expect(error.message).toBe("Unknown app: missing")
  })
})

describe("confirmWorkspaceAddition", () => {
  test("reports dependencies and uses the default destination in non-interactive mode", async () => {
    await useTemporaryWorkspace("init-confirm-workspace-")
    const prompter = createPrompterTestContext()
    const layer = Layer.merge(BunServices.layer, prompter.layer)
    const plan = await Effect.runPromise(
      selectWorkspaceAddition(appManifest, {
        type: "app",
        workspace: "app",
      }).pipe(Effect.provide(layer))
    )

    const destination = await Effect.runPromise(
      confirmWorkspaceAddition(plan, { yes: true }).pipe(Effect.provide(prompter.layer))
    )

    expect(destination).toBe("app")
    expect(prompter.logs).toContainEqual({
      level: "info",
      message: "Required workspaces: auth",
    })
    expect(prompter.logs).toContainEqual({
      level: "warning",
      message: "Unfulfilled recommendations:\napp → api: Only needed for remote calls.",
    })
  })

  test("fails for an invalid destination", async () => {
    await useTemporaryWorkspace("init-confirm-invalid-workspace-")
    const prompter = createPrompterTestContext()
    const layer = Layer.merge(BunServices.layer, prompter.layer)
    const plan = await Effect.runPromise(
      selectWorkspaceAddition(appManifest, {
        type: "app",
        workspace: "app",
      }).pipe(Effect.provide(layer))
    )

    const error = await Effect.runPromise(
      Effect.flip(
        confirmWorkspaceAddition(plan, {
          destination: "Invalid Name",
          yes: true,
        }).pipe(Effect.provide(prompter.layer))
      )
    )

    expect(error._tag).toBe("InvalidWorkspaceSelection")
    expect(error.message).toStartWith("Invalid destination name:")
  })
})

describe("writeWorkspaceAddition", () => {
  test("copies, renames, and removes omitted workspace dependencies", async () => {
    const directory = await useTemporaryWorkspace("init-write-workspace-")
    const templateDirectory = join(directory, "template")
    mkdirSync(join(templateDirectory, "packages/source"), { recursive: true })
    await writeFile(
      join(templateDirectory, "packages/source/package.json"),
      JSON.stringify({
        dependencies: {
          api: "workspace:*",
          react: "19.1.0",
        },
        name: "@init/source",
      })
    )
    const prompter = createPrompterTestContext()
    const plan = await Effect.runPromise(
      selectWorkspaceAddition(packageManifest, {
        type: "package",
        workspace: "source",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )

    const copiedDirectories = await Effect.runPromise(
      writeWorkspaceAddition({
        destinationName: "copied",
        plan,
        projectName: "demo",
        templateDirectory,
      }).pipe(Effect.provide(BunServices.layer))
    )

    expect(copiedDirectories).toEqual(["packages/copied"])
    expect(JSON.parse(await readFile("packages/copied/package.json", "utf8"))).toEqual({
      dependencies: { react: "19.1.0" },
      name: "@demo/copied",
    })
  })

  test("fails when the requested destination already exists", async () => {
    const directory = await useTemporaryWorkspace("init-write-existing-workspace-")
    const templateDirectory = join(directory, "template")
    await mkdir(join(templateDirectory, "packages/source"), { recursive: true })
    await writeFile(
      join(templateDirectory, "packages/source/package.json"),
      '{"name":"@init/source"}\n'
    )
    await mkdir("packages/copied", { recursive: true })
    const prompter = createPrompterTestContext()
    const plan = await Effect.runPromise(
      selectWorkspaceAddition(packageManifest, {
        type: "package",
        workspace: "source",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )

    const error = await Effect.runPromise(
      Effect.flip(
        writeWorkspaceAddition({
          destinationName: "copied",
          plan,
          projectName: "demo",
          templateDirectory,
        }).pipe(Effect.provide(BunServices.layer))
      )
    )

    expect(error._tag).toBe("InvalidWorkspaceSelection")
    expect(error.message).toBe("Destination already exists: packages/copied")
  })

  test("removes copied workspaces when a later copy fails", async () => {
    const directory = await useTemporaryWorkspace("init-write-rollback-workspace-")
    const templateDirectory = join(directory, "template")
    await mkdir(join(templateDirectory, "apps/app"), { recursive: true })
    await mkdir(join(templateDirectory, "packages/auth"), { recursive: true })
    await writeFile(join(templateDirectory, "apps/app/package.json"), '{"name":"app"}\n')
    await writeFile(
      join(templateDirectory, "packages/auth/package.json"),
      '{"name":"@init/auth"}\n'
    )
    const prompter = createPrompterTestContext()
    const plan = await Effect.runPromise(
      selectWorkspaceAddition(appManifest, {
        type: "app",
        workspace: "app",
      }).pipe(Effect.provide(Layer.merge(BunServices.layer, prompter.layer)))
    )
    await mkdir("packages/auth", { recursive: true })

    const error = await Effect.runPromise(
      Effect.flip(
        writeWorkspaceAddition({
          destinationName: "copied",
          plan,
          projectName: "demo",
          templateDirectory,
        }).pipe(Effect.provide(BunServices.layer))
      )
    )

    expect(error._tag).toBe("InvalidWorkspaceSelection")
    expect(error.message).toBe("Destination already exists: packages/auth")
    expect(existsSync("apps/copied")).toBeFalse()
  })
})
