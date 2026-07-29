import * as p from "@clack/prompts"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { OperationCancelled, PromptFailed } from "#lib/core/errors.ts"

export type PrompterService = {
  readonly cancel: (message: string) => Effect.Effect<void>
  readonly confirm: (
    options: p.ConfirmOptions
  ) => Effect.Effect<boolean, OperationCancelled | PromptFailed>
  readonly intro: (message: string) => Effect.Effect<void>
  readonly log: {
    readonly error: (message: string) => Effect.Effect<void>
    readonly info: (message: string) => Effect.Effect<void>
    readonly success: (message: string) => Effect.Effect<void>
    readonly warning: (message: string) => Effect.Effect<void>
  }
  readonly multiselect: <T>(
    options: p.MultiSelectOptions<T>
  ) => Effect.Effect<T[], OperationCancelled | PromptFailed>
  readonly select: <T>(
    options: p.SelectOptions<T>
  ) => Effect.Effect<T, OperationCancelled | PromptFailed>
  readonly text: (
    options: p.TextOptions
  ) => Effect.Effect<string, OperationCancelled | PromptFailed>
  readonly outro: (message: string) => Effect.Effect<void>
}

export class Prompter extends Context.Service<Prompter, PrompterService>()("Prompter") {
  static readonly layer = Layer.succeed(this)({
    cancel: (message) =>
      Effect.sync(() => {
        p.cancel(message)
      }),
    confirm: (options) =>
      Effect.tryPromise({
        catch: (cause) => new PromptFailed({ cause }),
        try: (signal) =>
          p.confirm({
            ...options,
            signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal,
          }),
      }).pipe(
        Effect.filterOrFail(
          (value) => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
    intro: (message) =>
      Effect.sync(() => {
        p.intro(message)
      }),
    log: {
      error: (message) =>
        Effect.sync(() => {
          p.log.error(message)
        }),
      info: (message) =>
        Effect.sync(() => {
          p.log.info(message)
        }),
      success: (message) =>
        Effect.sync(() => {
          p.log.success(message)
        }),
      warning: (message) =>
        Effect.sync(() => {
          p.log.warning(message)
        }),
    },
    multiselect: <T>(options: p.MultiSelectOptions<T>) =>
      Effect.tryPromise({
        catch: (cause) => new PromptFailed({ cause }),
        try: (signal) =>
          p.multiselect({
            ...options,
            signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal,
          }),
      }).pipe(
        Effect.filterOrFail(
          (value): value is T[] => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
    outro: (message) =>
      Effect.sync(() => {
        p.outro(message)
      }),
    select: <T>(options: p.SelectOptions<T>) =>
      Effect.tryPromise({
        catch: (cause) => new PromptFailed({ cause }),
        try: (signal) =>
          p.select({
            ...options,
            signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal,
          }),
      }).pipe(
        Effect.filterOrFail(
          (value): value is T => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
    text: (options) =>
      Effect.tryPromise({
        catch: (cause) => new PromptFailed({ cause }),
        try: (signal) =>
          p.text({
            ...options,
            signal: options.signal ? AbortSignal.any([options.signal, signal]) : signal,
          }),
      }).pipe(
        Effect.filterOrFail(
          (value) => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
  })
}
