import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { TemplateDownloader } from "#lib/services/template-downloader.ts"
import { readManifest } from "#lib/templates/manifest.ts"

export const acquireWorkspaceTemplate = Effect.fn("acquireWorkspaceTemplate")(function* (
  version: string | null
) {
  const fs = yield* FileSystem.FileSystem
  const downloader = yield* TemplateDownloader
  const directory = yield* Effect.acquireRelease(
    fs.makeTempDirectory({ prefix: "init-add-" }),
    (temporaryDirectory) =>
      fs.remove(temporaryDirectory, { force: true, recursive: true }).pipe(Effect.ignore)
  )

  yield* downloader.download({
    directory,
    force: true,
    source: `github:metaideas/init#${version ? `init@v${version}` : "main"}`,
  })

  return {
    directory,
    manifest: yield* readManifest(`${directory}/manifest.json`),
  }
})
