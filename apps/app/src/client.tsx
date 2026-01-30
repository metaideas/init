import { configureLogger } from "@init/observability/logger"
import { StartClient } from "@tanstack/react-start/client"
import { StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"

configureLogger({ isDevelopment: import.meta.env.DEV })

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
)
