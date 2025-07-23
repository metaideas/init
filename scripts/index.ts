#!/usr/bin/env bun
import Bun from "bun"
import { Command } from "commander"
import addCommand from "./add"
import checkCommand from "./check"
import graphCommand from "./graph"
import initCommand from "./init"
import updateCommand from "./update"

const packageJson = await Bun.file("package.json").json()

const program = new Command()

program.version(packageJson.version)

program
  .name("Init")
  .description(
    "A modern monorepo template for shipping TypeScript apps everywhere: web, mobile, desktop, and more."
  )

program
  .command("init")
  .description("Initialize project and clean up template files")
  .action(initCommand)

program
  .command("add")
  .description("Add workspaces to your monorepo")
  .action(addCommand)

program
  .command("update")
  .description("Sync with template updates")
  .action(updateCommand)

program
  .command("check")
  .description("Check template consistency")
  .action(checkCommand)

program
  .command("graph")
  .description("Generate dependency graph visualization")
  .action(graphCommand)

program.parse()
