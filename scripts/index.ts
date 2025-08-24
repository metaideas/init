#!/usr/bin/env bun
import Bun from "bun"
import { Command } from "commander"
import template from "./template"

const program = new Command()
  .name("Scripts")
  .description(
    "Scripts for your monorepo. Add any scripts you want here as commands."
  )

program.version(await Bun.file(".template-version").text())

// Run `bun scripts template` to see the available commands
program.addCommand(template)

program.parse()
