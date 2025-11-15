import { existsSync } from "node:fs"
import process from "node:process"
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
  const projectName = await consola.prompt(
    "What is the name of your project?",
    {
      type: "text",
      cancel: "undefined",
    }
  )

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
    consola.error(
      "Project name can only contain letters, numbers, hyphens, and underscores."
    )
    return promptProjectName()
  }

  return name
}

async function main() {
  consola.log(TITLE)

  const name = await promptProjectName()

  // Check if directory exists and ask for confirmation
  if (existsSync(name)) {
    const shouldOverwrite = await consola.prompt(
      `Directory "${name}" already exists. Do you want to overwrite it?`,
      {
        type: "confirm",
        initial: false,
        cancel: "undefined",
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
    consola.log(
      `Run \`cd ${name} && bun install\` to install your dependencies.`
    )
    consola.log("Run `bun template init` to initialize your project.")
    consola.success("Build something great! 🚀")
  } catch (error) {
    consola.error(`Failed to create project: ${error}`)
    process.exit(1)
  }
}

main().catch((error) => {
  // biome-ignore lint/suspicious/noConsole: output to console if we crash
  console.error(error)
  process.exit(1)
})
