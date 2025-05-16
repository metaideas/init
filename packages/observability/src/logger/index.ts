import pino from "pino"
import pretty from "pino-pretty"

import { remember } from "@init/utils/remember"

/**
 * This is the default logger to be used in other packages. For applications,
 * use the respective logger for the environment.
 */
export const logger = remember("logger", () => pino(pretty({ colorize: true })))

export { default as styles } from "chalk"
