import type { CommandModule } from "yargs"

export function defineCommand<T, U>(input: CommandModule<T, U>): CommandModule<T, U> {
  return input
}
