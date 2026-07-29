import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import * as Data from "effect/Data"

export class OperationCancelled extends Data.TaggedError("OperationCancelled") {}

export class PromptFailed extends Data.TaggedError("PromptFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}

export class DownloadFailed extends Data.TaggedError("DownloadFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}

export class VersionCheckFailed extends Data.TaggedError("VersionCheckFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}

export class GitHubRateLimited extends Data.TaggedError("GitHubRateLimited") {
  override readonly message = "GitHub API rate limit exceeded. Set GITHUB_TOKEN and try again."
}

export class NotInInitProject extends Data.TaggedError("NotInInitProject") {
  override readonly message =
    "This command must be run inside an init project. Make sure .template-version.json exists."
}

export class WorkingTreeDirty extends Data.TaggedError("WorkingTreeDirty") {
  override readonly message = "Please commit or stash changes before syncing."
}

export class InvalidVersion extends Data.TaggedError("InvalidVersion")<{
  readonly version: string
}> {
  override get message() {
    return `Invalid version: ${this.version}`
  }
}

export class TemplateVersionParseFailed extends Data.TaggedError("TemplateVersionParseFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return `Failed to parse .template-version.json: ${
      this.cause instanceof Error ? this.cause.message : String(this.cause)
    }`
  }
}

export class PackageJsonParseFailed extends Data.TaggedError("PackageJsonParseFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return this.cause instanceof Error ? this.cause.message : String(this.cause)
  }
}

export class ManifestParseFailed extends Data.TaggedError("ManifestParseFailed")<{
  readonly cause: unknown
}> {
  override get message() {
    return `Failed to parse template manifest: ${
      this.cause instanceof Error ? this.cause.message : String(this.cause)
    }`
  }
}

export class ManifestReadFailed extends Data.TaggedError("ManifestReadFailed")<{
  readonly cause: unknown
  readonly path: string
}> {
  override get message() {
    return `Template manifest not found at ${this.path}. This snapshot predates manifest-based setup or setup has already completed. Use a compatible template release or run \`bunx init-now@latest\`.`
  }
}

export class InvalidWorkspaceSelection extends Data.TaggedError("InvalidWorkspaceSelection")<{
  readonly details: string
}> {
  override get message() {
    return this.details
  }
}

export class CliNotFound extends Data.TaggedError("CliNotFound")<{
  readonly command: string
}> {
  override get message() {
    return `Required command \`${this.command}\` was not found on PATH.`
  }
}

export class CommandFailed extends Data.TaggedError("CommandFailed")<{
  readonly command: string
  readonly exitCode: ChildProcessSpawner.ExitCode
}> {
  override get message() {
    return `Command \`${this.command}\` failed with exit code ${this.exitCode}.`
  }
}
