#!/usr/bin/env bun
import { Command } from "commander"
import add from "./commands/add"
import check from "./commands/check"
import init from "./commands/init"
import update from "./commands/update"
import { VERSION } from "./version"

const program = new Command()

program.version(VERSION)

program
  .name("init-now")
  .description(
    "A modern monorepo template for shipping TypeScript apps everywhere: web, mobile, desktop, and more."
  )

program
  .command("init")
  .description("Initialize project and clean up template files")
  .action(init)

program
  .command("add")
  .description("Add workspaces to your monorepo")
  .action(add)

program
  .command("update")
  .description("Sync with template updates")
  .action(update)

program.command("check").description("Check template consistency").action(check)

program.parse()
