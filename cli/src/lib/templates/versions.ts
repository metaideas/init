import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Schema from "effect/Schema"
import { compare, valid } from "semver"
import { InvalidVersion, NotInInitProject, TemplateVersionParseFailed } from "#lib/core/errors.ts"

export const ReleaseInfoSchema = Schema.Struct({
  body: Schema.String,
  name: Schema.String,
  publishedAt: Schema.String,
  tagName: Schema.String,
})

export type ReleaseInfo = typeof ReleaseInfoSchema.Type

const TEMPLATE_VERSION_FILE = ".template-version.json"
const COMPONENT_PREFIX_REGEX = /^.*@/
const TemplateVersionSchema = Schema.Struct({ ".": Schema.String })

export const normalizeVersion = Effect.fn("normalizeVersion")(function* (version: string) {
  const normalizedVersion = valid(version.replace(COMPONENT_PREFIX_REGEX, ""))
  if (!normalizedVersion) return yield* Effect.fail(new InvalidVersion({ version }))
  return normalizedVersion
})

export const getVersion = Effect.fn("getVersion")(function* () {
  const fs = yield* FileSystem.FileSystem
  if (!(yield* fs.exists(TEMPLATE_VERSION_FILE))) return null

  const content = yield* fs.readFileString(TEMPLATE_VERSION_FILE)
  const data = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(TemplateVersionSchema))(
    content
  ).pipe(Effect.mapError((cause) => new TemplateVersionParseFailed({ cause })))
  return yield* normalizeVersion(data["."])
})

export const compareVersions = Effect.fn("compareVersions")(function* (
  current: string,
  latest: string
) {
  return compare(yield* normalizeVersion(current), yield* normalizeVersion(latest))
})

export const updateTemplateVersion = Effect.fn("updateTemplateVersion")(function* (
  version: string
) {
  const fs = yield* FileSystem.FileSystem
  const data = { ".": yield* normalizeVersion(version) }
  yield* fs.writeFileString(TEMPLATE_VERSION_FILE, `${JSON.stringify(data, null, 2)}\n`)
})

export const requireInitProject = Effect.fn("requireInitProject")(function* () {
  const fs = yield* FileSystem.FileSystem
  if (!(yield* fs.exists(TEMPLATE_VERSION_FILE))) {
    return yield* Effect.fail(new NotInInitProject())
  }
})
