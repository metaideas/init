#!/usr/bin/env bun
import Bun from "bun"
import { Command } from "commander"
import add from "./add"
import check from "./check"
import graph from "./graph"
import init from "./init"
import update from "./update"

const program = new Command()

program.version(await Bun.file(".template-version").text())

program
  .name("Init")
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

program
  .command("graph")
  .description("Generate dependency graph visualization")
  .action(graph)

program.parse()
