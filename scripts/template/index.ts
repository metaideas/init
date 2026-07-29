import { defineCommand } from "../utils"
import add from "./add"
import rename from "./rename"
import setup from "./setup"

export default defineCommand({
  builder: (yargs) =>
    yargs
      .command(setup)
      .command(rename)
      .command(add)
      .demandCommand(1, "Choose a template command. Run --help to see available commands.")
      .strict(),
  command: "template",
  describe: "Configure and maintain this template project",
  handler: () => Promise.resolve(),
})
