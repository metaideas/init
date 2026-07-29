import type { CommandModule } from "yargs"

export function defineCommand<T, U>(command: CommandModule<T, U>) {
  return command
}
