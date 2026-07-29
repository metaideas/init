import * as p from "@clack/prompts"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { OperationCancelled } from "#lib/shared/errors.ts"

export type PrompterService = {
  readonly cancel: (message: string) => Effect.Effect<void>
  readonly confirm: (options: p.ConfirmOptions) => Effect.Effect<boolean, OperationCancelled>
  readonly intro: (message: string) => Effect.Effect<void>
  readonly log: {
    readonly error: (message: string) => Effect.Effect<void>
    readonly info: (message: string) => Effect.Effect<void>
    readonly success: (message: string) => Effect.Effect<void>
    readonly warning: (message: string) => Effect.Effect<void>
  }
  readonly multiselect: <T>(
    options: p.MultiSelectOptions<T>
  ) => Effect.Effect<T[], OperationCancelled>
  readonly select: <T>(options: p.SelectOptions<T>) => Effect.Effect<T, OperationCancelled>
  readonly text: (options: p.TextOptions) => Effect.Effect<string, OperationCancelled>
  readonly outro: (message: string) => Effect.Effect<void>
}

export class Prompter extends Context.Service<Prompter, PrompterService>()("Prompter") {
  static readonly layer = Layer.succeed(this)({
    cancel: (message) =>
      Effect.sync(() => {
        p.cancel(message)
      }),
    confirm: (options) =>
      Effect.promise(() => p.confirm(options)).pipe(
        Effect.filterOrFail(
          (value): value is boolean => !p.isCancel(value),
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
      Effect.promise(() => p.multiselect(options)).pipe(
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
      Effect.promise(() => p.select(options)).pipe(
        Effect.filterOrFail(
          (value): value is T => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
    text: (options) =>
      Effect.promise(() => p.text(options)).pipe(
        Effect.filterOrFail(
          (value): value is string => !p.isCancel(value),
          () => new OperationCancelled()
        )
      ),
  })
}
