import { describe, expect, test } from "bun:test"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { TemplateManifest } from "#lib/templates/manifest.ts"
import { TemplateDownloader, type DownloadOptions } from "#lib/services/template-downloader.ts"
import { acquireWorkspaceTemplate } from "#lib/templates/acquisition.ts"

const manifest: TemplateManifest = {
  cleanupPaths: [],
  excludedPaths: [],
  workspaces: [
    {
      description: "App",
      dir: "apps/app",
      id: "app",
      name: "app",
      relationships: [],
      type: "app",
    },
  ],
}

describe("acquireWorkspaceTemplate", () => {
  test("downloads and reads the matching template release", async () => {
    const downloads: DownloadOptions[] = []
    const layer = Layer.mergeAll(
      BunServices.layer,
      Layer.succeed(TemplateDownloader)({
        download: (options) =>
          Effect.sync(() => {
            downloads.push(options)
            writeFileSync(join(options.directory, "manifest.json"), JSON.stringify(manifest))
          }),
      })
    )

    const template = await Effect.runPromise(
      acquireWorkspaceTemplate("2.0.2").pipe(Effect.scoped, Effect.provide(layer))
    )

    expect(template.manifest).toEqual(manifest)
    expect(downloads).toEqual([
      {
        directory: template.directory,
        force: true,
        source: "github:metaideas/init#init@v2.0.2",
      },
    ])
  })
})
