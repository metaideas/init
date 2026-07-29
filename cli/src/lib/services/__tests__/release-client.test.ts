import { describe, expect, test } from "bun:test"
import { mapReleaseError } from "#lib/services/release-client.ts"

describe("mapReleaseError", () => {
  test("identifies GitHub rate-limit responses", () => {
    const error = mapReleaseError({
      response: { headers: { "x-ratelimit-remaining": "0" } },
      status: 403,
    })

    expect(error._tag).toBe("GitHubRateLimited")
    expect(error.message).toContain("GITHUB_TOKEN")
  })

  test("preserves generic release failures", () => {
    expect(mapReleaseError(new Error("network failed"))._tag).toBe("VersionCheckFailed")
  })
})
