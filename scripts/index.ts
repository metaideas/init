import process from "node:process"
import { Command } from "@effect/cli"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect } from "effect"

const main = Command.make("scripts").pipe(
  Command.withDescription("Internal scripts for your monorepo"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("Write any scripts you need in scripts/index.ts")
    })
  )
  // Command.withSubcommands([]) // Add subcommands here
)

const cli = Command.run(main, {
  name: "scripts",
  version: "0.0.0",
})

cli(process.argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain)
