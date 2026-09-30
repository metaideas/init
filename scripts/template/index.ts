import { defineCommand } from "citty"

import add from "./add"
import diff from "./diff"
import doctor from "./doctor"
import remove from "./remove"
import setup from "./setup"

export default defineCommand({
  meta: {
    description: "Configure and maintain this template project",
    name: "template",
  },
  subCommands: { add, diff, doctor, remove, setup },
})
