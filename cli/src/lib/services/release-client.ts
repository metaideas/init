import process from "node:process"
import { Octokit } from "@octokit/rest"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { GitHubRateLimited, VersionCheckFailed } from "#lib/shared/errors.ts"
import { ReleaseInfoSchema, type ReleaseInfo } from "#lib/shared/releases.ts"

type GitHubError = {
  readonly response?: { readonly headers?: Record<string, string> }
  readonly status?: number
}

export function mapReleaseError(cause: unknown): GitHubRateLimited | VersionCheckFailed {
  const error = cause as GitHubError
  if (error.status === 403 && error.response?.headers?.["x-ratelimit-remaining"] === "0") {
    return new GitHubRateLimited()
  }
  return new VersionCheckFailed({ cause })
}

export class ReleaseClient extends Context.Service<
  ReleaseClient,
  {
    readonly getLatest: () => Effect.Effect<
      ReleaseInfo,
      GitHubRateLimited | VersionCheckFailed | Schema.SchemaError
    >
  }
>()("ReleaseClient") {
  static readonly layer = Layer.succeed(this)({
    getLatest: () => {
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
      return Effect.tryPromise({
        catch: mapReleaseError,
        try: () => octokit.repos.getLatestRelease({ owner: "metaideas", repo: "init" }),
      }).pipe(
        Effect.flatMap((response) =>
          Schema.decodeUnknownEffect(ReleaseInfoSchema)({
            body: response.data.body ?? "",
            name: response.data.name ?? "",
            publishedAt: response.data.published_at ?? "",
            tagName: response.data.tag_name,
          })
        )
      )
    },
  })
}
