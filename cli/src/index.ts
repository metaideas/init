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

function centerText(input: string): string {
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.trimEnd()) // Remove trailing spaces
    .filter((line) => line.length > 0) // Remove empty lines
  const terminalWidth = process.stdout.columns || 80
  const maxLineLength = Math.max(...lines.map((line) => line.length))

  // Account for the border that @clack/prompts intro() adds (┌ + space = ~2 chars)
  // and some additional padding it might add
  const borderWidth = 2
  const availableWidth = terminalWidth - borderWidth

  // Calculate padding needed to center the longest line
  const padding = Math.max(0, Math.floor((availableWidth - maxLineLength) / 2))

  // Apply padding to each line
  return lines.map((line) => " ".repeat(padding) + line).join("\n")
}

async function main() {
  intro(centerText(TITLE))

  const projectName = await text({
    message: "What is the name of your project?",
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

  try {
    await downloadTemplate("github:metaideas/init", { dir: name })

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
