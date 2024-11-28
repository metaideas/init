import env from "@this/env/axiom"
import pino from "pino"
import pretty from "pino-pretty"

function createLogger() {
  if (env.IS_DEVELOPMENT) {
    return pino(pretty())
  }

  return pino(
    { level: "info" },
    pino.transport({
      targets: [
        {
          target: "@axiomhq/pino",
          options: { dataset: env.AXIOM_DATASET, token: env.AXIOM_TOKEN },
        },
        { target: "pino-pretty" },
      ],
    })
  )
}

/**
 * This is the default logger to be used in other packages. For applications,
 * use the respective logger for the environment.
 */
export const logger = createLogger()
