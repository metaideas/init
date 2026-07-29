import { join } from "node:path"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import { major } from "semver"
import { normalizeVersion } from "#lib/templates/versions.ts"

const TemplateVersionSchema = Schema.Struct({ ".": Schema.String })

export function getCompatibilityWarning(cliVersion: string, templateVersion: string) {
  const cliMajor = major(cliVersion)
  const templateMajor = major(templateVersion)
  if (cliMajor >= templateMajor) return
  return `CLI ${cliVersion} and template ${templateVersion} use different major versions. Run \`bunx init-now@latest\` before continuing.`
}

export const getSnapshotVersion = Effect.fn("getSnapshotVersion")(function* (directory: string) {
  const fs = yield* FileSystem.FileSystem
  return yield* fs.readFileString(join(directory, ".template-version.json")).pipe(
    Effect.flatMap((content) =>
      Schema.decodeUnknownEffect(Schema.fromJsonString(TemplateVersionSchema))(content)
    ),
    Effect.flatMap((data) => normalizeVersion(data["."])),
    Effect.catch(() => Effect.succeed(null))
  )
})
