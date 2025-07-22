import Bun from "bun"
import { isCancel, log, multiselect, outro, select, text } from "@clack/prompts"
import { runProcess, runScript } from "../tooling/helpers"
import { Workspaces } from "./utils"

type WorkspaceType = "app" | "package"

async function getWorkspaceType(): Promise<WorkspaceType> {
  const workspaceType = await select({
    message: "Which type of workspace would you like to add?",
    options: [
      {
        value: "APPS",
        label: "App",
      },
      {
        value: "PACKAGES",
        label: "Package",
      },
    ],
  })

  if (isCancel(workspaceType)) {
    outro("Canceled adding workspace")
    process.exit()
  }

  switch (workspaceType) {
    case "APPS":
      return "app"
    case "PACKAGES":
      return "package"
    default:
      throw new Error("Invalid workspace type")
  }
}

async function chooseWorkspaces(type: WorkspaceType): Promise<string[]> {
  const options = Workspaces[type === "app" ? "APPS" : "PACKAGES"].map((w) => ({
    value: w.name,
    label: w.description,
  }))

  const workspaces = await multiselect({
    message: `Which ${type}(s) would you like to add?`,
    options,
  })

  if (isCancel(workspaces)) {
    outro("Canceled adding package")
    process.exit()
  }

  return workspaces
}

async function getWorkspaceName(workspace: string): Promise<string> {
  const workspaceName = await text({
    message: `What is the name of the ${workspace} app?`,
    defaultValue: workspace,
  })

  if (isCancel(workspaceName)) {
    outro("Canceled adding app")
    process.exit()
  }

  return workspaceName
}

async function getProjectName() {
  const packageJson = await Bun.file("package.json").json()
  return packageJson.name
}

async function main() {
  log.step("Add a workspace app or package")

  const workspaceType = await getWorkspaceType()

  const isApp = workspaceType === "app"

  const workspaces = await chooseWorkspaces(workspaceType)

  const projectName = getProjectName()

  const workspaceNames = await Promise.all(
    workspaces.map((workspace) =>
      isApp ? getWorkspaceName(workspace) : Promise.resolve(workspace)
    )
  )

  for (const workspaceName of workspaceNames) {
    runProcess("turbo", [
      "gen",
      "workspace",
      "--copy",
      `https://github.com/metaideas/init/tree/main/${workspaceType}s/${workspaceName}`,
      "--type",
      workspaceType,
      "--name",
      isApp ? workspaceName : `@${projectName}/${workspaceName}`,
    ])

    log.success(`Added "${workspaceName}" ${workspaceType} to the workspace`)
  }

  log.step("Finished adding workspaces")

  log.step(`Now replacing "@init/" with "@${projectName}/" in the workspace`)

  await runProcess("pnpm", ["workspace:replace"])

  log.success("Done!")
}

runScript(main)
