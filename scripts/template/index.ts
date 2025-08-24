// These are commands to manage the `init` template itself. You can run them by running `bun template`

import { Command } from "commander"
import add from "./add"
import check from "./check"
import init from "./init"
import update from "./update"
import { getVersion } from "./utils"

const program = new Command()
  .name("template")
  .description("Commands to manage the `init` template")

program.version(await getVersion())

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

program.command("check").description("Check template version").action(check)

export default program
