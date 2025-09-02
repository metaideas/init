import { existsSync } from "node:fs"
import process from "node:process"
import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  text,
} from "@clack/prompts"
import degit from "degit"

const OWNER = "metaideas"
const REPO = "init"
const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/i

const title = `
  ███              ███   █████
 ░░░              ░░░   ░░███
 ████  ████████   ████  ███████
░░███ ░░███░░███ ░░███ ░░░███░
 ░███  ░███ ░███  ░███   ░███
 ░███  ░███ ░███  ░███   ░███ ███
 █████ ████ █████ █████  ░░█████
░░░░░ ░░░░ ░░░░░ ░░░░░    ░░░░░
`

async function main() {
  intro(title)

  const projectName = await text({
    message: "What do you want to name your project?",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Project name is required."
      }

      if (!PROJECT_NAME_REGEX.test(value.trim())) {
        return "Project name can only contain letters, numbers, hyphens, and underscores."
      }
    },
  })

  if (!projectName || isCancel(projectName)) {
    cancel("Please provide a name for your project.")
    process.exit(1)
  }

  const name = projectName.trim()

  // Check if directory exists and ask for confirmation
  if (existsSync(name)) {
    const shouldOverwrite = await confirm({
      message: `Directory "${name}" already exists. Do you want to overwrite it?`,
      initialValue: false,
    })

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel("Operation cancelled.")
      process.exit(1)
    }
  }

  const emitter = degit(`${OWNER}/${REPO}`, {
    cache: true,
    force: true,
    verbose: true,
  })

  emitter.on("info", (info) => log.info(info.message))

  try {
    await emitter.clone(name)
    log.success(`Created "${name}" using ▶︎ init.`)
    log.message(
      `Run \`cd ${name} && bun install\` to install your dependencies.`
    )
    log.message("Run `bun template init` to initialize your project.")
    outro("Build something using great! 🚀")
  } catch (error) {
    cancel(`Failed to create project: ${error}`)
    process.exit(1)
  }
}

main().catch((error) => {
  // biome-ignore lint/suspicious/noConsole: output to console if we crash
  console.error(error)
  process.exit(1)
})
