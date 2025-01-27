import pino from "pino"
import pretty from "pino-pretty"

/**
 * This is the default logger to be used in other packages. For applications,
 * use the respective logger for the environment.
 */
export const logger = pino(pretty())

export { default as styles } from "chalk"
