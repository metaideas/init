import Bun from "bun"
import consola from "consola"
import { defineCommand } from "../helpers"
import { workspaces } from "./utils"

export default defineCommand({
  command: "add",
  describe: "Add workspaces to your monorepo",
  handler: () => {
    // Handler required by yargs, but demandCommand(1) ensures
    // help is shown when no subcommand is provided
  },
  builder: (yargs) =>
    yargs
      .command({
        command: "app",
        describe: "Add an app to your monorepo",
        handler: async () => {
          consola.info("Add app to your monorepo")

          try {
            const selectedWorkspace = await consola.prompt(
              "Which app would you like to add?",
              {
                type: "select",
                options: workspaces.apps.map((w) => ({
                  label: w.description,
                  value: w.name,
                })),
                cancel: "undefined",
              }
            )

            if (selectedWorkspace === undefined) {
              throw new Error("Setup cancelled. No changes have been made.")
            }

            const workspaceName = await consola.prompt(
              `What is the name of the ${selectedWorkspace} app?`,
              {
                type: "text",
                default: selectedWorkspace,
                cancel: "undefined",
              }
            )

            if (workspaceName === undefined) {
              throw new Error("Setup cancelled. No changes have been made.")
            }

            const name = selectedWorkspace.replace(/["\\]/g, "\\$&")

            await Bun.$`turbo gen workspace --copy https://github.com/metaideas/init/tree/main/apps/${selectedWorkspace} --type app --name "${name}"`

            consola.success("🎉 App generated successfully!")
          } catch (error) {
            consola.error(`Operation cancelled: ${error}`)
            process.exit(1)
          }
        },
      })
      .command({
        command: "package",
        describe: "Add a package to your monorepo",
        handler: async () => {
          consola.info("Add package to your monorepo")

          try {
            const selectedWorkspace = await consola.prompt(
              "Which package would you like to add?",
              {
                type: "select",
                options: workspaces.packages.map((w) => ({
                  label: w.description,
                  value: w.name,
                })),
                cancel: "undefined",
              }
            )

            if (selectedWorkspace === undefined) {
              throw new Error("Canceled adding workspace")
            }

            const projectName = await Bun.file("package.json")
              .json()
              .then((data) => data.name as string)

            const workspaceName = selectedWorkspace.replace(/["\\]/g, "\\$&")
            const name = `@${projectName}/${workspaceName}`

            await Bun.$`turbo gen workspace --copy https://github.com/metaideas/init/tree/main/packages/${selectedWorkspace} --type package --name "${name}"`

            consola.success("🎉 Package generated successfully!")
          } catch (error) {
            consola.error(`Operation cancelled: ${error}`)
            process.exit(1)
          }
        },
      })
      .demandCommand(1)
      .strict()
      .showHelpOnFail(true),
})
