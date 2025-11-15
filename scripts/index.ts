#!/usr/bin/env bun
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import template from "./template"

yargs(hideBin(process.argv))
  .describe(
    "scripts",
    "Scripts for your monorepo. Add any scripts you want here as commands."
  )
  .command(template)
  .parse()
