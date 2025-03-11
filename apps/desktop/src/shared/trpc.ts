import type { TRPCClient } from "api/client"

import { createTRPCClients } from "@this/utils/trpc"

import { buildApiUrl } from "~/shared/utils"

export const { trpcClient, useTRPC, useTRPCClient, TRPCProvider } =
  createTRPCClients<TRPCClient>(buildApiUrl("/trpc"))
