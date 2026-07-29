import { join, resolve } from "node:path"
import consola from "consola"

import { defineCommand } from "../utils"
import {
  checkIsPathWithinRoot,
  getProjectScope,
  getScopePrefix,
  normalizeScope,
  readJson,
  replaceTextInFiles,
  TemplateFault,
  writeJson,
} from "./shared"

export type RenameOptions = {
  projectName?: string
  rootDir: string
  scope: string
  sourceScope: string
}

export type RenameResult = {
  changedFiles: string[]
}

export async function renameProject({
  rootDir,
  projectName,
  scope,
  sourceScope,
}: RenameOptions): Promise<RenameResult> {
  const normalizedScope = normalizeScope(scope)
  const normalizedSourceScope = normalizeScope(sourceScope)
  const changedFiles = await replaceTextInFiles(
    rootDir,
    getScopePrefix(normalizedSourceScope),
    getScopePrefix(normalizedScope)
  )

  if (!projectName) return { changedFiles }

  const packageJsonPath = join(rootDir, "package.json")
  const packageJson = await readJson(packageJsonPath)
  if (packageJson.name === projectName) return { changedFiles }

  packageJson.name = projectName
  await writeJson(packageJsonPath, packageJson)
  changedFiles.push(packageJsonPath)

  return { changedFiles }
}

export default defineCommand({
  builder: (yargs) =>
    yargs
      .option("name", {
        describe: "New root package name",
        type: "string",
      })
      .option("scope", {
        describe: "New npm scope, without the leading @ (defaults to --name)",
        type: "string",
      })
      .option("workspace", {
        describe: "Rewrite only this workspace directory",
        type: "string",
      }),
  command: "rename",
  describe: "Rename the project and replace the template workspace scope",
  handler: async (args) => {
    const projectRoot = resolve(process.cwd())
    const projectName = args.name
    if (!args.workspace && !projectName) {
      throw TemplateFault.create("InvalidArgumentsError").withDescription(
        "Provide --name when renaming a project.",
        "A project rename requires --name when --workspace is not set."
      )
    }

    const scope = args.scope ?? projectName
    if (!scope) {
      throw TemplateFault.create("InvalidArgumentsError").withDescription(
        "Provide --scope when renaming a workspace.",
        "A workspace rename requires --scope when --name is not set."
      )
    }

    const rootDir = args.workspace ? resolve(projectRoot, args.workspace) : projectRoot
    if (args.workspace && !checkIsPathWithinRoot(projectRoot, rootDir)) {
      throw TemplateFault.create("PathEscapeError", { path: args.workspace }).withDescription(
        "Workspace path must be inside the project.",
        `Resolved workspace path: ${rootDir}.`
      )
    }
    if (!(await Bun.file(join(rootDir, "package.json")).exists())) {
      throw TemplateFault.create("InvalidArgumentsError").withDescription(
        "Workspace path must contain a package.json file.",
        `Resolved workspace path: ${rootDir}.`
      )
    }

    const result = await renameProject({
      projectName: args.workspace ? undefined : projectName,
      rootDir,
      scope,
      sourceScope: await getProjectScope(projectRoot),
    })

    if (result.changedFiles.length === 0) consola.info("Nothing to rename.")
    else consola.info(`Renamed ${result.changedFiles.length} file(s).`)
  },
})
