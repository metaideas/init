import process from "node:process"
import Bun from "bun"
import consola from "consola"
import { downloadTemplate } from "giget"

const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/i

const TITLE = `
          
            ███              ███   █████   
           ░░░              ░░░   ░░███    
           ████  ████████   ████  ███████  
          ░░███ ░░███░░███ ░░███ ░░░███░   
           ░███  ░███ ░███  ░███   ░███    
           ░███  ░███ ░███  ░███   ░███ ███
           █████ ████ █████ █████  ░░█████ 
          ░░░░░ ░░░░ ░░░░░ ░░░░░    ░░░░░  
          
`

async function promptProjectName(): Promise<string> {
  const projectName = await consola.prompt("What is the name of your project?", {
    cancel: "undefined",
    type: "text",
  })

  if (projectName === undefined) {
    consola.error("Please provide a name for your project.")
    process.exit(1)
  }

  const name = projectName.trim()

  if (!name || name.length === 0) {
    consola.error("Project name is required.")
    return promptProjectName()
  }

  if (!PROJECT_NAME_REGEX.test(name)) {
    consola.error("Project name can only contain letters, numbers, hyphens, and underscores.")
    return promptProjectName()
  }

  return name
}

async function main() {
  consola.log(TITLE)

  const name = await promptProjectName()

  const exists = await Bun.file(name)
    .stat()
    .then((stat) => stat.isDirectory())
    .catch(() => false)

  // Check if directory exists and ask for confirmation
  if (exists) {
    const shouldOverwrite = await consola.prompt(
      `Directory "${name}" already exists. Do you want to overwrite it?`,
      {
        cancel: "undefined",
        initial: false,
        type: "confirm",
      }
    )

    if (shouldOverwrite === undefined || !shouldOverwrite) {
      consola.error("Operation cancelled.")
      process.exit(1)
    }
  }

  try {
    await downloadTemplate("github:metaideas/init", { dir: name })

    consola.success(`Created "${name}" using ▶︎ init.`)

    const confirm = await consola.prompt("Do you want to install dependencies?", {
      cancel: "undefined",
      initial: true,
      type: "confirm",
    })

    if (confirm) {
      await Bun.$`cd ${name} && bun install`
    }

    consola.info("Remember to run `bun template init` to initialize your project.")
    consola.success("Build something great! 🚀")
  } catch (error) {
    consola.error(
      `Failed to create project: ${error instanceof Error ? error.message : String(error)}`
    )
    process.exit(1)
  }
}

main().catch((_error: unknown) => {
  process.exit(1)
})
