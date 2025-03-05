import type { TRPCClient } from "api/client"
import { useState } from "react"

import { createTRPCClients } from "@this/utils/trpc"

import { buildApiUrl } from "~/shared/utils"

export const {
  trpcReact: trpc,
  trpcVanilla: client,
  links,
} = createTRPCClients<TRPCClient>(buildApiUrl("/trpc"))

export function useTRPCClient() {
  const [client] = useState(() => trpc.createClient({ links }))
  return client
}

export const TRPCProvider = trpc.Provider
