"use client"

import {
  AxiomJSTransport,
  Logger,
  ProxyTransport,
  type Transport,
} from "@axiomhq/logging"
import { nextJsFormatters } from "@axiomhq/nextjs/client"
import { singleton } from "@init/utils/singleton"
import axiom from "."

export function createLogger(
  token: string,
  dataset: string,
  options?: { nextjs?: boolean; proxyUrl?: string }
) {
  const transports: [Transport, ...Transport[]] = [
    new AxiomJSTransport({ axiom: axiom(token), dataset }),
  ]

  if (options?.proxyUrl) {
    transports.push(
      new ProxyTransport({ url: options.proxyUrl, autoFlush: true })
    )
  }

  return singleton(
    "axiom-client-logger",
    () =>
      new Logger({
        transports,
        formatters: options?.nextjs ? nextJsFormatters : undefined,
      })
  )
}

export { createUseLogger, createWebVitalsComponent } from "@axiomhq/react"
