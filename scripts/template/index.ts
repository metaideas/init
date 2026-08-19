import { defineCommand } from "citty"

import add from "./add"
import rename from "./rename"
import setup from "./setup"

const subCommands = {
  add,
  rename,
  setup,
}

export default defineCommand({
  meta: {
    description: "Configure and maintain this template project",
    name: "template",
  },
  subCommands,
})
