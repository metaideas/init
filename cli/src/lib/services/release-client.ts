import process from "node:process"
import { Octokit } from "@octokit/rest"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import { GitHubRateLimited, VersionCheckFailed } from "#lib/shared/errors.ts"
import { ReleaseInfoSchema, type ReleaseInfo } from "#lib/shared/releases.ts"

export function mapReleaseError(cause: unknown) {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "status" in cause &&
    cause.status === 403 &&
    "response" in cause &&
    typeof cause.response === "object" &&
    cause.response !== null &&
    "headers" in cause.response &&
    typeof cause.response.headers === "object" &&
    cause.response.headers !== null &&
    "x-ratelimit-remaining" in cause.response.headers &&
    cause.response.headers["x-ratelimit-remaining"] === "0"
  ) {
    return new GitHubRateLimited()
  }
  return new VersionCheckFailed({ cause })
}

export class ReleaseClient extends Context.Service<
  ReleaseClient,
  {
    readonly getLatest: () => Effect.Effect<ReleaseInfo, GitHubRateLimited | VersionCheckFailed>
  }
>()("ReleaseClient") {
  static readonly layer = Layer.succeed(this)({
    getLatest: () => {
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
      return Effect.tryPromise({
        catch: mapReleaseError,
        try: (signal) =>
          octokit.repos.getLatestRelease({
            owner: "metaideas",
            repo: "init",
            request: { signal },
          }),
      }).pipe(
        Effect.flatMap((response) =>
          Schema.decodeUnknownEffect(ReleaseInfoSchema)({
            body: response.data.body ?? "",
            name: response.data.name ?? "",
            publishedAt: response.data.published_at ?? "",
            tagName: response.data.tag_name,
          }).pipe(Effect.mapError((cause) => new VersionCheckFailed({ cause })))
        )
      )
    },
  })
}
