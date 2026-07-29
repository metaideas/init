import consola from "consola"
import { isFault } from "faultier"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import template from "./template"

try {
  await yargs(hideBin(process.argv))
    .scriptName("bun scripts")
    .usage("$0 <command>")
    .command(template)
    .epilogue("Add your own project commands to scripts/index.ts.")
    .demandCommand(1, "Choose a command. Run --help to see available commands.")
    .strict()
    .help()
    .fail((message, error: unknown, yargs) => {
      if (error !== undefined) throw error as Error

      yargs.showHelp()
      if (message) consola.error(message)
      process.exitCode = 1
    })
    .parseAsync()
} catch (error) {
  if (isFault(error)) {
    consola.error(error.flatten())

    const details = error.flatten({ field: "details" })
    if (details) consola.error(details)
  } else if (error instanceof Error) {
    consola.error(error.stack ?? error.message)
  } else {
    consola.error(String(error))
  }

  process.exitCode = 1
}
