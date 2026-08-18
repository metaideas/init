import { defineCommand, showUsage, type ArgsDef, type CommandContext, type CommandDef } from "citty"
import consola from "consola"
import { isFault } from "faultier"

type TemplateCommandDefinition<T extends ArgsDef> = Omit<CommandDef<T>, "args"> & {
  args: T
}

export function defineTemplateCommand<const T extends ArgsDef>(
  definition: TemplateCommandDefinition<T>
) {
  const run = definition.run

  return defineCommand({
    ...definition,
    run: run
      ? async (context: CommandContext<T>) => {
          try {
            const unknownOption = getUnknownOption(context.rawArgs, definition.args)
            if (unknownOption) {
              await showUsage(context.cmd)
              consola.error(`Unknown option: --${unknownOption}`)
              process.exitCode = 1
              return
            }

            await run(context)
          } catch (error) {
            if (!isFault(error)) throw error

            consola.error(error.flatten())

            const details = error.flatten({ field: "details" })
            if (details) consola.error(details)
            process.exitCode = 1
          }
        }
      : undefined,
  })
}

export function getUnknownOption(rawArgs: string[], args: ArgsDef): string | undefined {
  const knownNames = new Set<string>()

  for (const [name, definition] of Object.entries(args)) {
    knownNames.add(normalizeOptionName(name))
    const aliases = "alias" in definition ? getAliases(definition.alias) : []
    for (const alias of aliases) knownNames.add(normalizeOptionName(alias))
  }

  for (const argument of rawArgs) {
    if (argument === "--") break
    if (!argument.startsWith("--")) continue

    const name = argument.slice(2).split("=", 1)[0]?.replace(/^no-/, "")
    if (name && !knownNames.has(normalizeOptionName(name))) return name
  }

  return undefined
}

export function getOptionBeforeCommand(
  rawArgs: string[],
  parentCommandName: string,
  commandNames: ReadonlySet<string>
) {
  if (rawArgs[0] !== parentCommandName) return null
  const argument = rawArgs[1]
  if (!argument || commandNames.has(argument)) return null
  if (argument === "--" || argument === "--help" || argument === "-h") return null
  if ((argument === "--version" || argument === "-v") && rawArgs.length === 2) return null
  if (argument.startsWith("-")) return argument.replace(/^-+/, "").split("=", 1)[0]

  return null
}

function getAliases(alias: string | string[] | undefined) {
  if (!alias) return []
  return Array.isArray(alias) ? alias : [alias]
}

export function normalizeOptionName(name: string) {
  return name.replaceAll(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}
