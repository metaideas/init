#!/usr/bin/env bun
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

void yargs(hideBin(process.argv))
  .describe("scripts", "Scripts for your monorepo. Add any scripts you want here as commands.")
  // .command(
  //   // Use the `defineCommand` helper to define the command and add it here.
  // )
  .parse()
