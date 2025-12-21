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
        type: "text",
        placeholder: "my-app",
        cancel: "undefined",
      })

      if (newProjectName === undefined) {
        throw new Error("Rename cancelled. No changes have been made.")
      }

      const packageJson = await Bun.file("package.json").json()
      const currentProjectName = packageJson.name as string
      const isInit = currentProjectName === "init"

      consola.start(`Updating project name to ${newProjectName as string} in package.json...`)
      await updatePackageJson(newProjectName as string)
      consola.success("Project name updated in package.json.")

      consola.start(
        `Replacing @init${isInit ? "" : ` and @${currentProjectName}`} with @${newProjectName as string} in project files...`
      )
      await replaceProjectNameInProjectFiles(newProjectName as string, currentProjectName)
      consola.success("References updated in project files.")

      consola.success("🎉 Project rename complete!")
    } catch (error) {
      consola.error(`Operation cancelled: ${error}`)
      process.exit(1)
    }
  },
})
