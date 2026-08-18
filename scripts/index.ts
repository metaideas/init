import { defineCommand, runMain } from "citty"
import consola from "consola"

import template from "./template"
import { getOptionBeforeCommand } from "./utils"

const templateCommandNames = new Set(["add", "rename", "setup"])

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
const misplacedOption = getOptionBeforeCommand(rawArgs, templateCommandNames)

if (misplacedOption) {
  consola.error(`Place --${misplacedOption} after the template subcommand.`)
  process.exitCode = 1
} else {
  await runMain(main, { rawArgs })
}
