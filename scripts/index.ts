import { defineCommand, runMain } from "citty"
import consola from "consola"

import template, { templateSubCommands } from "./template"
import { getOptionBeforeCommand } from "./utils"

const main = defineCommand({
  meta: {
    description: "Run project and template commands",
    name: "bun scripts",
  },
  subCommands: {
    template,
  },
})

const rawArgs = process.argv.slice(2)
const misplacedOption = getOptionBeforeCommand(
  rawArgs,
  "template",
  new Set(Object.keys(templateSubCommands))
)

if (misplacedOption) {
  consola.error(`Place --${misplacedOption} after the template subcommand.`)
  process.exitCode = 1
} else {
  await runMain(main, { rawArgs })
}
