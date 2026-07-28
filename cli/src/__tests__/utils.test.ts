import { afterEach, describe, expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { BunContext } from "@effect/platform-bun"
import { Effect } from "effect"
import { compareVersions, getVersion, normalizeVersion, updateTemplateVersion } from "#utils.ts"

const originalWorkingDirectory = process.cwd()
let temporaryDirectory: string | undefined

afterEach(async () => {
  process.chdir(originalWorkingDirectory)
  if (temporaryDirectory) await rm(temporaryDirectory, { force: true, recursive: true })
  temporaryDirectory = undefined
})

describe("compareVersions", () => {
  test("compares bare semantic versions", async () => {
    expect(await Effect.runPromise(compareVersions("1.1.0", "2.0.0"))).toBe(-1)
  })

  test("compares v-prefixed semantic versions", async () => {
    expect(await Effect.runPromise(compareVersions("v1.1.0", "v2.0.0"))).toBe(-1)
  })

  test("compares component-prefixed release tags", async () => {
    expect(await Effect.runPromise(compareVersions("1.1.0", "init@v2.0.0"))).toBe(-1)
    expect(await Effect.runPromise(compareVersions("init@v2.0.0", "1.1.0"))).toBe(1)
  })

  test("compares prerelease versions", async () => {
    expect(await Effect.runPromise(compareVersions("2.0.0-beta.1", "2.0.0"))).toBe(-1)
  })

  test("rejects non-numeric versions", async () => {
    await expect(Effect.runPromise(compareVersions("init@latest", "1.1.0"))).rejects.toThrow(
      "Invalid version"
    )
  })
})

describe("normalizeVersion", () => {
  test.each(["1.1.0", "v1.1.0", "init@v1.1.0"])("normalizes %s", async (version) => {
    expect(await Effect.runPromise(normalizeVersion(version))).toBe("1.1.0")
  })

  test("normalizes prereleases and ignores build metadata", async () => {
    expect(await Effect.runPromise(normalizeVersion("init@v2.0.0-beta.1+build.2"))).toBe(
      "2.0.0-beta.1"
    )
  })
})

describe("getVersion", () => {
  test("reads previously corrupted component-prefixed versions", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-utils-"))
    process.chdir(temporaryDirectory)
    await writeFile(".template-version.json", '{".":"init@v1.1.0"}\n')

    const version = await Effect.runPromise(getVersion().pipe(Effect.provide(BunContext.layer)))

    expect(version).toBe("1.1.0")
  })
})

describe("updateTemplateVersion", () => {
  test("stores a bare semantic version", async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), "init-now-utils-"))
    process.chdir(temporaryDirectory)

    await Effect.runPromise(
      updateTemplateVersion("init@v2.0.0").pipe(Effect.provide(BunContext.layer))
    )

    const content = await readFile(".template-version.json", "utf8")
    expect(JSON.parse(content)).toEqual({ ".": "2.0.0" })
  })

  test("propagates invalid versions", async () => {
    await expect(
      Effect.runPromise(updateTemplateVersion("latest").pipe(Effect.provide(BunContext.layer)))
    ).rejects.toThrow("Invalid version")
  })
})
