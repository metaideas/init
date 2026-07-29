import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { VersionCheckFailed } from "#lib/core/errors.ts"
import { Prompter, type PrompterService } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { getTemplateVersionStatus, resolveTemplateRef } from "#lib/templates/releases.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

function makeLayer(latestVersion: string) {
  return Layer.mergeAll(
    BunServices.layer,
    Layer.succeed(ReleaseClient)({
      getLatest: () =>
        Effect.succeed({
          body: "",
          name: latestVersion,
          publishedAt: "2026-07-29",
          tagName: `init@v${latestVersion}`,
        }),
    })
  )
}

function makePrompter(warnings: string[]): PrompterService {
  return {
    cancel: () => Effect.void,
    confirm: () => Effect.succeed(false),
    intro: () => Effect.void,
    log: {
      error: () => Effect.void,
      info: () => Effect.void,
      success: () => Effect.void,
      warning: (message) =>
        Effect.sync(() => {
          warnings.push(message)
        }),
    },
    multiselect: () => Effect.succeed([]),
    outro: () => Effect.void,
    select: () => Effect.die("Unexpected select prompt"),
    text: () => Effect.die("Unexpected text prompt"),
  }
}

describe("getTemplateVersionStatus", () => {
  test("reports an unknown version when template metadata is missing", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-template-"))
    process.chdir(temporaryDirectory)

    const version = await Effect.runPromise(
      getTemplateVersionStatus().pipe(Effect.provide(makeLayer("2.0.2")))
    )

    expect(version.status).toBe("unknown")
    expect(version.currentVersion).toBeNull()
  })

  test("reports when the local template is behind the latest release", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-template-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"2.0.1"}\n')

    const version = await Effect.runPromise(
      getTemplateVersionStatus().pipe(Effect.provide(makeLayer("2.0.2")))
    )

    expect(version.status).toBe("behind")
    expect(version.currentVersion).toBe("2.0.1")
  })
})

describe("resolveTemplateRef", () => {
  test("uses the requested ref without checking releases", async () => {
    const templateRef = await Effect.runPromise(
      resolveTemplateRef("feature").pipe(
        Effect.provide(
          Layer.mergeAll(
            Layer.succeed(Prompter)(makePrompter([])),
            Layer.succeed(ReleaseClient)({
              getLatest: () => Effect.die("Unexpected release lookup"),
            })
          )
        )
      )
    )

    expect(templateRef).toBe("feature")
  })

  test("falls back to main when the latest release cannot be resolved", async () => {
    const warnings: string[] = []
    const templateRef = await Effect.runPromise(
      resolveTemplateRef().pipe(
        Effect.provide(
          Layer.mergeAll(
            Layer.succeed(Prompter)(makePrompter(warnings)),
            Layer.succeed(ReleaseClient)({
              getLatest: () => Effect.fail(new VersionCheckFailed({ cause: new Error("offline") })),
            })
          )
        )
      )
    )

    expect(templateRef).toBe("main")
    expect(warnings).toEqual([
      "Could not resolve the latest release (offline). Falling back to main.",
    ])
  })
})
