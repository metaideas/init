import Bun from "bun"
import consola from "consola"
import { defineCommand } from "../helpers"
import { replaceProjectNameInProjectFiles } from "./utils"

async function updatePackageJson(projectName: string) {
  const packageJson = await Bun.file("package.json").json()

  packageJson.name = projectName
  await Bun.write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`)
}

export default defineCommand({
  command: "rename",
  describe: "Rename the project and update all @init references",
  handler: async () => {
    consola.info("Starting project rename...")

    try {
      const newProjectName = await consola.prompt("Enter your new project name", {
        cancel: "undefined",
        placeholder: "my-app",
        type: "text",
      })

      if (newProjectName === undefined) {
        throw new Error("Rename cancelled. No changes have been made.")
      }

      const packageJson = await Bun.file("package.json").json()
      const currentProjectName = packageJson.name as string
      const isInit = currentProjectName === "init"

      consola.start(`Updating project name to ${newProjectName} in package.json...`)
      await updatePackageJson(newProjectName)
      consola.success("Project name updated in package.json.")

      consola.start(
        `Replacing @init${isInit ? "" : ` and @${currentProjectName}`} with @${newProjectName} in project files...`
      )
      await replaceProjectNameInProjectFiles(newProjectName, currentProjectName)
      consola.success("References updated in project files.")

      consola.success("🎉 Project rename complete!")
    } catch (error) {
      consola.error(
        `Operation cancelled: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  },
})
