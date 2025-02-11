import fs from "node:fs/promises"
import { isCancel, log, multiselect, outro, select } from "@clack/prompts"
import { runProcess, runScript } from "../tooling/helpers"

async function main() {
  log.info("Generating a dependency graph")

  const workspaceType = await select({
    message: "Which type of workspace would you like to add?",
    options: [
      {
        value: "apps",
        label: "apps",
      },
      {
        value: "packages",
        label: "packages",
      },
      {
        value: "tooling",
        label: "tooling",
      },
    ],
  })

  if (isCancel(workspaceType)) {
    log.error("Canceled adding workspace")
    process.exit()
  }

  const entries = await fs.readdir(workspaceType, { withFileTypes: true })
  const folders = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)

  if (folders.length === 0) {
    outro("No folders found")
    process.exit()
  }

  const selectedPackages = await multiselect({
    message: "Which packages would you like to include?",
    options: folders.map(folder => ({
      value: folder,
      label: folder,
    })),
  })

  if (isCancel(selectedPackages)) {
    log.error("Canceled adding package")
    process.exit()
  }

  if (selectedPackages.length === 0) {
    log.error("No packages selected")
    process.exit()
  }

  const packagePaths =
    selectedPackages.length > 1
      ? `{${selectedPackages.join(",")}}`
      : selectedPackages[0]

  await runProcess("depcruise", [
    `./${workspaceType}/${packagePaths}/src/**/*.{ts,tsx}`,
    "--output-type",
    "dot",
    "|",
    "dot",
    "-T",
    "svg",
    ">",
    "dependency-graph.svg",
  ])

  log.info("Generated dependency graph at dependency-graph.svg")
}

runScript(main)
