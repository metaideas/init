import { afterEach, describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import {
  checkShouldExclude,
  getAllFiles,
  getProjectNameValidationError,
  updatePackageJson,
} from "#lib/projects/files.ts"

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

describe("checkShouldExclude", () => {
  test("respects custom excluded paths", () => {
    expect(checkShouldExclude("cache/output.txt", ["cache"])).toBe(true)
    expect(checkShouldExclude("node_modules/package.json", ["cache"])).toBe(false)
  })

  test("uses default exclusions when omitted", () => {
    expect(checkShouldExclude("node_modules/package.json")).toBe(true)
    expect(checkShouldExclude("apps/app/.DS_Store")).toBe(true)
  })
})

describe("getAllFiles", () => {
  test("returns files without directory entries", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-project-"))
    process.chdir(temporaryDirectory)
    await mkdir("tooling/tsconfig", { recursive: true })
    await writeFile("tooling/tsconfig/base.json", "{}\n")

    const files = await Effect.runPromise(getAllFiles().pipe(Effect.provide(BunServices.layer)))

    expect(files).toEqual(["tooling/tsconfig/base.json"])
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
