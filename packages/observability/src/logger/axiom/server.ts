import { AxiomJSTransport, Logger } from "@axiomhq/logging"
import { nextJsFormatters } from "@axiomhq/nextjs"
import { singleton } from "@init/utils/singleton"
import axiom from "."

export function createLogger(
  token: string,
  dataset: string,
  options?: { nextjs?: boolean }
) {
  return singleton(
    "axiom-server-logger",
    () =>
      new Logger({
        transports: [new AxiomJSTransport({ axiom: axiom(token), dataset })],
        formatters: options?.nextjs ? nextJsFormatters : undefined,
      })
  )
}
