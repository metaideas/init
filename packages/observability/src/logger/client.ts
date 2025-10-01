"use client"

import { Axiom } from "@axiomhq/js"
import { AxiomJSTransport, Logger, ProxyTransport } from "@axiomhq/logging"

export function createLogger(
  token: string,
  dataset: string,
  options?: { proxyUrl?: string }
) {
  return new Logger({
    transports: [
      // Proxy requests to the Axiom API
      options?.proxyUrl
        ? new ProxyTransport({ url: options.proxyUrl, autoFlush: true })
        : new AxiomJSTransport({ axiom: new Axiom({ token }), dataset }),
    ],
  })
}

export { createUseLogger, createWebVitalsComponent } from "@axiomhq/react"
