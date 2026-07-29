import { describe, expect, test } from "bun:test"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Terminal from "effect/Terminal"
import { printTitle } from "#lib/shared/terminal.ts"

function makeTerminalLayer(columns: number) {
  return Layer.succeed(Terminal.Terminal)(
    Terminal.make({
      columns: Effect.succeed(columns),
      display: () => Effect.void,
      readInput: Effect.never,
      readLine: Effect.never,
      rows: Effect.succeed(24),
    })
  )
}

function makeConsoleLayer(logs: string[]) {
  return Layer.succeed(Console.Console)({
    ...globalThis.console,
    info: (...args) => {
      logs.push(args.map(String).join(" "))
    },
  })
}

describe("printTitle", () => {
  test("prints the title when the terminal is wide enough", async () => {
    const logs: string[] = []
    const layer = Layer.merge(makeTerminalLayer(120), makeConsoleLayer(logs))

    await Effect.runPromise(printTitle().pipe(Effect.provide(layer)))

    expect(logs).toHaveLength(1)
    expect(logs[0]).toContain("████")
  })

  test("does not print the title when the terminal is too narrow", async () => {
    const logs: string[] = []
    const layer = Layer.merge(makeTerminalLayer(1), makeConsoleLayer(logs))

    await Effect.runPromise(printTitle().pipe(Effect.provide(layer)))

    expect(logs).toHaveLength(0)
  })
})
