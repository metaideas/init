#!/usr/bin/env bun
import { Command } from "commander"
import template from "./template"
import { getVersion } from "./template/utils"

const program = new Command()
  .name("Scripts")
  .description(
    "Scripts for your monorepo. Add any scripts you want here as commands."
  )

program.version(await getVersion())

// Run `bun scripts template` to see the available commands
program.addCommand(template)

program.parse()
