import { defineCommand, runMain } from "citty"

import template from "./template"

const main = defineCommand({
  meta: {
    description: "Run project and template commands",
    name: "bun scripts",
  },
  subCommands: {
    template,
  },
})

await runMain(main)
