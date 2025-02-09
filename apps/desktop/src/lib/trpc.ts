import type { TRPCClient } from "api/client"

import { createTRPCClients } from "@this/utils/trpc"

import { buildApiUrl } from "~/lib/utils"

export const {
  reactClient: trpc,
  vanillaClient: client,
  links,
} = createTRPCClients<TRPCClient>(buildApiUrl("/trpc"))
