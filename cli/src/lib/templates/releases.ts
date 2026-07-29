import * as Effect from "effect/Effect"
import { Prompter } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { compareVersions, getVersion, type ReleaseInfo } from "#lib/templates/versions.ts"

export type TemplateVersionStatus =
  | {
      readonly currentVersion: null
      readonly latestRelease: ReleaseInfo
      readonly status: "unknown"
    }
  | {
      readonly currentVersion: string
      readonly latestRelease: ReleaseInfo
      readonly status: "ahead" | "current" | "behind"
    }

export const getTemplateVersionStatus = Effect.fn("getTemplateVersionStatus")(function* () {
  const releases = yield* ReleaseClient
  const [currentVersion, latestRelease] = yield* Effect.all([getVersion(), releases.getLatest()], {
    concurrency: 2,
  })

  if (currentVersion === null) {
    return {
      currentVersion: null,
      latestRelease,
      status: "unknown",
    } satisfies TemplateVersionStatus
  }

  const comparison = yield* compareVersions(currentVersion, latestRelease.tagName)
  return {
    currentVersion,
    latestRelease,
    status: comparison === 0 ? "current" : comparison > 0 ? "ahead" : "behind",
  } satisfies TemplateVersionStatus
})

export const resolveTemplateRef = Effect.fn("resolveTemplateRef")(function* (
  requestedRef?: string
) {
  if (requestedRef) return requestedRef

  const releases = yield* ReleaseClient
  const prompter = yield* Prompter
  return yield* releases.getLatest().pipe(
    Effect.map((release) => release.tagName),
    Effect.catch((error) =>
      Effect.gen(function* () {
        yield* prompter.log.warning(
          `Could not resolve the latest release (${error.message}). Falling back to main.`
        )
        return "main"
      })
    )
  )
})
