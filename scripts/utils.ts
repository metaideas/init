import { defineCommand, type ArgsDef, type CommandContext, type CommandDef } from "citty"
import consola from "consola"
import { isFault } from "faultier"

export function defineTemplateCommand<const T extends ArgsDef>(definition: CommandDef<T>) {
  const run = definition.run

  return defineCommand({
    ...definition,
    run: run
      ? async (context: CommandContext<T>) => {
          try {
            const unknownOption = getUnknownOption(context.rawArgs, definition.args as T)
            if (unknownOption) {
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

function getUnknownOption(rawArgs: string[], args: ArgsDef): string | undefined {
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

function getAliases(alias: string | string[] | undefined) {
  if (!alias) return []
  return Array.isArray(alias) ? alias : [alias]
}

export function normalizeOptionName(name: string) {
  return name.replaceAll(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}
