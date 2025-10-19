import { defineCommand, runMain } from "citty"
import add from "./commands/add"
import check from "./commands/check"
import remove from "./commands/remove"
import setup from "./commands/setup"
import update from "./commands/update"

const main = defineCommand({
  meta: {
    name: "init-now",
    description: "Initialize a new project with init",
  },
  subCommands: {
    setup,
    add,
    remove,
    check,
    update,
  },
})

void runMain(main)
