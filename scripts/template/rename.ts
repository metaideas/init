import Bun from "bun"
import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts"
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
    intro("Starting project rename...")

    try {
      const newProjectName = await text({
        message: "Enter your new project name",
        placeholder: "my-app",
      })

      if (isCancel(newProjectName)) {
        throw new Error("Rename cancelled. No changes have been made.")
      }

      const packageJson = await Bun.file("package.json").json()
      const currentProjectName = packageJson.name as string
      const isInit = currentProjectName === "init"

      const s1 = spinner()
      s1.start(`Updating project name to ${newProjectName} in package.json...`)
      await updatePackageJson(newProjectName)
      s1.stop("Project name updated in package.json.")

      const s2 = spinner()
      s2.start(
        `Replacing @init${isInit ? "" : ` and @${currentProjectName}`} with @${newProjectName} in project files...`
      )
      await replaceProjectNameInProjectFiles(newProjectName, currentProjectName)
      s2.stop("References updated in project files.")

      outro("🎉 Project rename complete!")
    } catch (error) {
      cancel(`Operation cancelled: ${error}`)
    }
  },
})
