"use client"

import { Axiom } from "@axiomhq/js"
import { AxiomJSTransport, Logger, ProxyTransport } from "@axiomhq/logging"
import { nextJsFormatters } from "@axiomhq/nextjs/client"

export function createLogger(
  token: string,
  dataset: string,
  options?: { nextjs?: boolean; proxyUrl?: string }
) {
  return new Logger({
    transports: [
      // Proxy requests to the Axiom API
      options?.proxyUrl
        ? new ProxyTransport({ url: options.proxyUrl, autoFlush: true })
        : new AxiomJSTransport({ axiom: new Axiom({ token }), dataset }),
    ],
    formatters: options?.nextjs ? nextJsFormatters : undefined,
  })
}

export { createUseLogger, createWebVitalsComponent } from "@axiomhq/react"
