import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { downloadTemplate } from "giget"
import { DownloadFailed } from "#lib/shared/errors.ts"

export type DownloadOptions = {
  readonly directory: string
  readonly force: boolean
  readonly source: string
}

export class TemplateDownloader extends Context.Service<
  TemplateDownloader,
  { readonly download: (options: DownloadOptions) => Effect.Effect<void, DownloadFailed> }
>()("TemplateDownloader") {
  static readonly layer = Layer.succeed(this)({
    download: ({ directory, force, source }) =>
      Effect.tryPromise({
        catch: (cause) => new DownloadFailed({ cause }),
        try: () => downloadTemplate(source, { dir: directory, force }),
      }).pipe(Effect.asVoid),
  })
}
