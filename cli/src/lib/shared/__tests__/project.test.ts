import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import { getProjectNameValidationError, updatePackageJson } from "#lib/shared/project.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("getProjectNameValidationError", () => {
  test("accepts npm-scope-safe project names", () => {
    expect(getProjectNameValidationError("my-app_2")).toBeUndefined()
  })

  test.each(["", "MyApp", "my app", "-my-app"])("rejects %j", (name) => {
    expect(getProjectNameValidationError(name)).toBeString()
  })
})

describe("updatePackageJson", () => {
  test("rejects valid JSON that is not an object", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-project-"))
    process.chdir(temporaryDirectory)
    await writeFile("package.json", "null\n")

    const error = await Effect.runPromise(
      Effect.flip(updatePackageJson("project").pipe(Effect.provide(BunServices.layer)))
    )

    expect(error._tag).toBe("PackageJsonParseFailed")
  })
})
