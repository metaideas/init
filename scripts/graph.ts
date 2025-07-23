import fs from "node:fs/promises"
import { prompt, runProcess } from "@tooling/helpers"

async function getWorkspaceTypes() {
  const workspaceType = await prompt.multiselect({
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

  if (prompt.isCancel(workspaceType)) {
    prompt.log.error("Canceled adding workspace")
    process.exit()
  }

  return workspaceType
}

async function getEntries(workspaceType: string) {
  const entries = await fs.readdir(workspaceType, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

async function chooseEntries(entries: string[]) {
  const selectedEntries = await prompt.multiselect({
    message: "Which entries would you like to include?",
    options: entries.map((entry) => ({
      value: entry,
      label: entry,
    })),
  })

  if (prompt.isCancel(selectedEntries)) {
    prompt.log.error("Canceled adding package")
    process.exit()
  }

  if (selectedEntries.length === 0) {
    prompt.log.error("No entries selected")
    process.exit()
  }

  return selectedEntries
}

async function graph() {
  prompt.log.info("Generating a dependency graph")

  const workspaceTypes = await getWorkspaceTypes()

  const entries = (
    await Promise.all(
      workspaceTypes.map(async (workspaceType) => {
        const e = await getEntries(workspaceType)
        return e.map((entry) => `${workspaceType}/${entry}`)
      })
    )
  ).flat()

  // console.prompt.log(entries)
  if (entries.length === 0) {
    prompt.outro("No folders found")
    process.exit()
  }

  const selectedEntries = await chooseEntries(entries)

  const packagePaths =
    selectedEntries.length > 1
      ? `{${selectedEntries.join(",")}}`
      : selectedEntries[0]

  // Graph visualization configuration parameters
  const layoutEngine = "dot" // Graph layout algorithm: dot (hierarchical), neato (spring model), fdp (force-directed)
  const rankdir = "TD" // Direction of graph layout: TD (top-down) or LR (left-right)
  const ranksep = "0.6" // Vertical spacing between ranks (layers) in the graph
  const nodesep = "0.3" // Horizontal spacing between nodes within the same rank
  const margin = "0.2" // Outer margin around the entire graph
  const splines = "polyline" // Edge routing style: polyline (angled) or ortho (orthogonal)
  const concentrate = "true" // Combines multiple edges between the same nodes into a single edge

  await runProcess("depcruise", [
    `./${packagePaths}/src/**/*.{ts,tsx}`,
    "--output-type",
    "archi",
    "|",
    layoutEngine,
    "-T",
    "svg",
    `-Grankdir=${rankdir}`,
    `-Granksep=${ranksep}`,
    `-Gnodesep=${nodesep}`,
    `-Gmargin=${margin}`,
    `-Gsplines=${splines}`,
    `-Gconcentrate=${concentrate}`,
    ">",
    "dependency-graph.svg",
  ])

  prompt.log.info("Generated dependency graph at dependency-graph.svg")
}

export default graph
