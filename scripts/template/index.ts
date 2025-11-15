// These are commands to manage the `init` template itself. You can run them by running `bun template`

import { defineCommand } from "../../tooling/helpers"
import add from "./add"
import check from "./check"
import init from "./init"
import rename from "./rename"
import update from "./update"

export default defineCommand({
  command: "template",
  describe: "Commands to manage the `init` template",
  handler: () => {
    // Handler required by yargs, but demandCommand(1) ensures
    // help is shown when no subcommand is provided
  },
  builder: (yargs) =>
    yargs
      .command(add)
      .command(init)
      .command(rename)
      .command(update)
      .command(check)
      .demandCommand(1)
      .strict()
      .showHelpOnFail(true),
})
